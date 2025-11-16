"""
AI Advisor API routes.
"""
import logging
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.budget import Budget
from app.crud import expense, budget
from sqlalchemy import func

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    """Request schema for AI chat."""
    message: str = Field(..., min_length=1, description="User message")
    conversation_history: Optional[list] = Field(default_factory=list, description="Previous conversation messages")


class ChatResponse(BaseModel):
    """Response schema for AI chat."""
    response: str = Field(..., description="AI advisor response")
    suggestions: Optional[list[str]] = Field(default_factory=list, description="Suggested follow-up questions")


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Chat with AI financial advisor.
    
    Args:
        chat_request: Chat request with user message
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        AI advisor response
    """
    try:
        # Get user's financial data for context
        user_expenses = expense.get_by_user(
            db, user_id=current_user.id, skip=0, limit=50
        )
        
        # Get user's budgets
        user_budgets = budget.get_by_user(
            db, user_id=current_user.id, skip=0, limit=50
        )
        
        # Get budget status
        from datetime import datetime
        current_month = datetime.utcnow().strftime("%Y-%m")
        budget_status_list = []
        for budget_item in user_budgets:
            if budget_item.month == current_month:
                # Calculate spent for this budget
                year, month_num = map(int, current_month.split('-'))
                month_start = datetime(year, month_num, 1).date()
                if month_num == 12:
                    month_end = datetime(year + 1, 1, 1).date()
                else:
                    month_end = datetime(year, month_num + 1, 1).date()
                
                spent = (
                    db.query(func.sum(Expense.amount))
                    .filter(
                        Expense.user_id == current_user.id,
                        Expense.category == budget_item.category,
                        func.date(Expense.date) >= month_start,
                        func.date(Expense.date) < month_end
                    )
                    .scalar() or 0.0
                )
                
                budget_status_list.append({
                    "category": budget_item.category.value if hasattr(budget_item.category, 'value') else str(budget_item.category),
                    "limit": budget_item.limit_amount,
                    "spent": spent,
                    "remaining": budget_item.limit_amount - spent,
                })
        
        # Calculate totals
        total_expenses = sum(e.amount for e in user_expenses)
        total_budget = sum(b.limit_amount for b in user_budgets if b.month == current_month)
        total_spent_this_month = sum(
            e.amount for e in user_expenses
            if e.date and e.date.strftime("%Y-%m") == current_month
        )
        
        # Get category breakdown
        category_totals = {}
        for e in user_expenses:
            cat = e.category.value if hasattr(e.category, 'value') else str(e.category)
            category_totals[cat] = category_totals.get(cat, 0) + e.amount
        
        # Generate AI response based on user message and financial data
        user_message = chat_request.message.lower()
        response = generate_financial_advice(
            user_message,
            total_expenses=total_expenses,
            total_budget=total_budget,
            total_spent_this_month=total_spent_this_month,
            category_totals=category_totals,
            budget_status=budget_status_list,
            expenses_count=len(user_expenses),
        )
        
        # Generate suggestions
        suggestions = generate_suggestions(user_message, budget_status_list)
        
        logger.info(f"AI chat request from user {current_user.id}")
        return ChatResponse(response=response, suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error in AI chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process AI chat request"
        )


def generate_financial_advice(
    user_message: str,
    total_expenses: float = 0.0,
    total_budget: float = 0.0,
    total_spent_this_month: float = 0.0,
    category_totals: dict = None,
    budget_status: list = None,
    expenses_count: int = 0,
) -> str:
    """Generate financial advice based on user message and financial data."""
    if category_totals is None:
        category_totals = {}
    if budget_status is None:
        budget_status = []
    
    # Budget-related questions
    if any(word in user_message for word in ["budget", "save", "spending", "limit"]):
        if total_budget > 0:
            percentage_used = (total_spent_this_month / total_budget * 100) if total_budget > 0 else 0
            remaining = total_budget - total_spent_this_month
            
            if percentage_used > 100:
                return f"⚠️ You've exceeded your monthly budget by ${abs(remaining):.2f}. I recommend reviewing your spending in the highest categories and cutting back on discretionary expenses. Consider adjusting your budget for next month based on actual needs."
            elif percentage_used > 80:
                return f"💡 You've used {percentage_used:.1f}% of your monthly budget (${total_spent_this_month:.2f} of ${total_budget:.2f}). You have ${remaining:.2f} remaining. Be mindful of your spending to stay within budget."
            else:
                return f"✅ Great job! You're on track with your budget. You've spent ${total_spent_this_month:.2f} out of ${total_budget:.2f} ({(100-percentage_used):.1f}% remaining). Keep monitoring your spending to maintain this healthy pattern."
        else:
            return "I recommend setting up budgets for different categories. Based on the 50/30/20 rule: allocate 50% for needs, 30% for wants, and 20% for savings. You can create budgets in the Budgets section."
    
    # Category-specific questions
    if any(word in user_message for word in ["category", "categories", "breakdown"]):
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            return f"Your top spending category is {top_category[0]} with ${top_category[1]:.2f}. Here's your category breakdown: {', '.join([f'{k}: ${v:.2f}' for k, v in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5]])}. Consider setting specific budgets for each category to better control your spending."
        else:
            return "You haven't recorded many expenses yet. Start tracking your expenses to see category breakdowns and identify spending patterns."
    
    # Savings questions
    if any(word in user_message for word in ["save", "saving", "savings", "invest"]):
        if total_budget > 0 and total_spent_this_month > 0:
            savings_potential = total_budget - total_spent_this_month
            if savings_potential > 0:
                return f"Based on your current spending, you could potentially save ${savings_potential:.2f} this month. I recommend: 1) Automate savings transfers, 2) Review and cancel unused subscriptions, 3) Cook at home more often, 4) Use cashback apps for purchases."
            else:
                return "You're currently over budget. To start saving: 1) Identify your highest spending categories, 2) Set realistic budgets, 3) Track every expense, 4) Look for areas to cut back. Small changes add up quickly!"
        else:
            return "To build savings: 1) Set up automatic transfers to a savings account, 2) Follow the 50/30/20 rule (50% needs, 30% wants, 20% savings), 3) Build an emergency fund of 3-6 months expenses, 4) Review and optimize your spending regularly."
    
    # Spending analysis
    if any(word in user_message for word in ["spending", "expense", "expenses", "analysis"]):
        if expenses_count > 0:
            avg_expense = total_expenses / expenses_count if expenses_count > 0 else 0
            return f"You've recorded {expenses_count} expenses totaling ${total_expenses:.2f} (average: ${avg_expense:.2f} per transaction). Your monthly spending is ${total_spent_this_month:.2f}. Review your spending patterns in the Analytics section for detailed insights."
        else:
            return "Start tracking your expenses to get detailed spending analysis. Record your transactions regularly to see patterns, identify trends, and make informed financial decisions."
    
    # Budget alerts
    if any(word in user_message for word in ["alert", "warning", "exceed", "over"]):
        if budget_status:
            exceeded = [b for b in budget_status if b.get("spent", 0) > b.get("limit", 0)]
            if exceeded:
                return f"⚠️ You've exceeded your budget in {len(exceeded)} categor{'y' if len(exceeded) == 1 else 'ies'}: {', '.join([b['category'] for b in exceeded])}. Review these categories and adjust your spending or budget limits."
            else:
                approaching = [b for b in budget_status if (b.get("spent", 0) / b.get("limit", 1) * 100) > 80]
                if approaching:
                    return f"💡 You're approaching your budget limit in {len(approaching)} categor{'y' if len(approaching) == 1 else 'ies'}: {', '.join([b['category'] for b in approaching])}. Monitor your spending closely."
                else:
                    return "✅ All your budgets are on track! Keep monitoring your spending to maintain this healthy financial pattern."
        else:
            return "Set up budgets in the Budgets section to receive alerts when you're approaching or exceeding your spending limits."
    
    # General advice
    if any(word in user_message for word in ["advice", "recommend", "help", "tip", "tips"]):
        advice_points = [
            "Track every expense for at least a month to understand your spending patterns",
            "Set category-wise budgets based on your income and financial goals",
            "Review your spending weekly and adjust as needed",
            "Automate savings transfers to build your emergency fund",
            "Identify and cancel unused subscriptions",
            "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
        ]
        return f"Here are my top financial recommendations:\n\n" + "\n".join([f"{i+1}. {point}" for i, point in enumerate(advice_points)])
    
    # Default response
    return "I'm your AI Finance Advisor! I can help you with:\n\n• Budget planning and tracking\n• Spending analysis and insights\n• Savings strategies\n• Category-wise spending breakdowns\n• Budget alerts and warnings\n• Financial goal setting\n\nWhat would you like to know about your finances?"


def generate_suggestions(user_message: str, budget_status: list) -> list[str]:
    """Generate suggested follow-up questions."""
    suggestions = []
    
    if "budget" in user_message.lower():
        suggestions.extend([
            "How can I reduce my spending?",
            "What's my current budget status?",
        ])
    elif "save" in user_message.lower() or "saving" in user_message.lower():
        suggestions.extend([
            "What are my top spending categories?",
            "How much can I save this month?",
        ])
    else:
        suggestions.extend([
            "What's my spending breakdown by category?",
            "How can I improve my budget?",
            "What are my spending trends?",
        ])
    
    return suggestions[:3]  # Return top 3 suggestions


@router.get("/insights")
async def get_ai_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get AI-generated financial insights.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        AI-generated insights
    """
    try:
        # Get user's financial data
        user_expenses = expense.get_by_user(db, user_id=current_user.id, skip=0, limit=100)
        user_budgets = budget.get_by_user(db, user_id=current_user.id, skip=0, limit=50)
        
        # Calculate insights
        total_expenses = sum(e.amount for e in user_expenses)
        expenses_count = len(user_expenses)
        
        # Category insights
        category_totals = {}
        for e in user_expenses:
            cat = e.category.value if hasattr(e.category, 'value') else str(e.category)
            category_totals[cat] = category_totals.get(cat, 0) + e.amount
        
        insights = []
        
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            insights.append({
                "type": "top_category",
                "title": "Top Spending Category",
                "message": f"Your highest spending is in {top_category[0]} with ${top_category[1]:.2f}",
            })
        
        if expenses_count > 0:
            avg_expense = total_expenses / expenses_count
            insights.append({
                "type": "average_spending",
                "title": "Average Transaction",
                "message": f"Your average transaction amount is ${avg_expense:.2f}",
            })
        
        return {"insights": insights}
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights"
        )

