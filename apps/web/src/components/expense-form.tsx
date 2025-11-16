// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useStore } from "@/store/use-store"
// import { Plus, Sparkles } from "lucide-react"

// const categories = [
//   "Groceries",
//   "Dining",
//   "Transportation",
//   "Entertainment",
//   "Utilities",
//   "Shopping",
//   "Healthcare",
//   "Other",
// ]

// export default function ExpenseForm() {
//   const [formData, setFormData] = useState({
//     description: "",
//     amount: "",
//     category: "Groceries",
//     date: new Date().toISOString().split("T")[0],
//   })

//   const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
//   const [aiLoading, setAiLoading] = useState(false)
//   const { addExpense } = useStore()

//   useEffect(() => {
//     if (formData.description.length > 3) {
//       const timer = setTimeout(async () => {
//         setAiLoading(true)
//         try {
//           const res = await fetch("/api/ai/categorize", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ description: formData.description }),
//           })
//           const data = await res.json()
//           setSuggestedCategory(data.category)
//           setFormData((prev) => ({ ...prev, category: data.category }))
//         } catch (error) {
//           console.error("Categorization error:", error)
//         } finally {
//           setAiLoading(false)
//         }
//       }, 500)
//       return () => clearTimeout(timer)
//     }
//   }, [formData.description])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (formData.description && formData.amount) {
//       await addExpense({
//         ...formData,
//         amount: Number.parseFloat(formData.amount),
//         date: new Date(formData.date).toISOString(),
//       })
//       setFormData({ description: "", amount: "", category: "Groceries", date: new Date().toISOString().split("T")[0] })
//       setSuggestedCategory(null)
//     }
//   }

//   return (
//     <div className="bg-card rounded-lg p-6 border border-border">
//       <h2 className="text-lg font-semibold text-foreground mb-4">Add Expense</h2>
//       <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Description"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//           {aiLoading && <Sparkles className="absolute right-3 top-2.5 w-4 h-4 text-primary animate-spin" />}
//         </div>
//         <input
//           type="number"
//           placeholder="Amount"
//           step="0.01"
//           value={formData.amount}
//           onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//           className="bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//         />
//         <select
//           value={formData.category}
//           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//           className="bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//         >
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//         <input
//           type="date"
//           value={formData.date}
//           onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//           className="bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//         />
//         <button
//           type="submit"
//           className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-6 py-2 flex items-center justify-center gap-2 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Add
//         </button>
//       </form>
//     </div>
//   )
// }


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Sparkles } from "lucide-react"
import { aiService } from "@/services/ai.service"
import { Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory } from "@/types"

// Validation schema matching your ExpenseCreate type
const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.nativeEnum(ExpenseCategory, {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  date: z.string().min(1, "Date is required"),
  recurring: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (data: ExpenseCreate | ExpenseUpdate) => Promise<void>
  onCancel?: () => void
}

// Map your ExpenseCategory enum to display names
const categoryDisplayNames: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FOOD]: "Food & Dining",
  [ExpenseCategory.TRANSPORTATION]: "Transportation",
  [ExpenseCategory.ENTERTAINMENT]: "Entertainment",
  [ExpenseCategory.UTILITIES]: "Utilities",
  [ExpenseCategory.HEALTHCARE]: "Healthcare",
  [ExpenseCategory.SHOPPING]: "Shopping",
  [ExpenseCategory.EDUCATION]: "Education",
  [ExpenseCategory.OTHER]: "Other",
}

const expenseCategories = Object.values(ExpenseCategory)

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [suggestedCategory, setSuggestedCategory] = useState<ExpenseCategory | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagsInput, setTagsInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense ? {
      description: expense.description,
      amount: expense.amount,
      category: expense.category as ExpenseCategory,
      date: expense.date,
      recurring: expense.recurring || false,
      tags: expense.tags || [],
    } : {
      date: new Date().toISOString().split('T')[0],
      category: ExpenseCategory.FOOD,
      recurring: false,
      tags: [],
    }
  })

  const description = watch("description")
  const recurring = watch("recurring")
  const tags = watch("tags")

  // AI categorization effect
  useEffect(() => {
    if (description && description.length > 3 && !expense) {
      const timer = setTimeout(async () => {
        setAiLoading(true)
        try {
          // Use the AI service for categorization
          const response = await aiService.getAdvice(
            `Categorize this expense description: "${description}". Respond with only one of these categories: ${expenseCategories.join(', ')}`
          )
          
          if (response.success && response.data) {
            const aiResponse = response.data.advice.toLowerCase()
            const matchedCategory = expenseCategories.find(cat => 
              aiResponse.includes(cat.toLowerCase())
            )
            
            if (matchedCategory) {
              setSuggestedCategory(matchedCategory)
              setValue("category", matchedCategory)
            }
          }
        } catch (error) {
          console.error("AI categorization error:", error)
          // Fallback categorization
          const fallbackCategory = fallbackCategorize(description)
          setSuggestedCategory(fallbackCategory)
          setValue("category", fallbackCategory)
        } finally {
          setAiLoading(false)
        }
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [description, expense, setValue])

  // Fallback categorization function
  const fallbackCategorize = (desc: string): ExpenseCategory => {
    const description = desc.toLowerCase()
    
    if (description.includes('grocery') || description.includes('supermarket') || description.includes('food') || description.includes('restaurant')) 
      return ExpenseCategory.FOOD
    if (description.includes('gas') || description.includes('fuel') || description.includes('uber') || description.includes('taxi') || description.includes('bus') || description.includes('train'))
      return ExpenseCategory.TRANSPORTATION
    if (description.includes('movie') || description.includes('netflix') || description.includes('game') || description.includes('concert'))
      return ExpenseCategory.ENTERTAINMENT
    if (description.includes('electric') || description.includes('water') || description.includes('internet') || description.includes('rent') || description.includes('mortgage'))
      return ExpenseCategory.UTILITIES
    if (description.includes('doctor') || description.includes('medical') || description.includes('pharmacy') || description.includes('hospital'))
      return ExpenseCategory.HEALTHCARE
    if (description.includes('mall') || description.includes('store') || description.includes('clothing') || description.includes('amazon'))
      return ExpenseCategory.SHOPPING
    if (description.includes('school') || description.includes('course') || description.includes('book') || description.includes('tuition'))
      return ExpenseCategory.EDUCATION
    
    return ExpenseCategory.OTHER
  }

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      if (!expense) {
        // Reset form if it's a new expense
        reset({
          description: "",
          amount: 0,
          category: ExpenseCategory.FOOD,
         date: new Date().toISOString().split('T')[0] + "T00:00:00",
          recurring: false,
          tags: [],
        })
        setSuggestedCategory(null)
        setTagsInput("")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      const newTags = [...tags, tagsInput.trim()]
      setValue("tags", newTags)
      setTagsInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setValue("tags", newTags)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {expense ? "Edit Expense" : "Add New Expense"}
      </h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Description with AI Categorization */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <div className="relative">
            <Input
              id="description"
              placeholder="Enter expense description"
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {aiLoading && (
              <Sparkles className="absolute right-3 top-2.5 w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          {suggestedCategory && (
            <p className="text-xs text-muted-foreground">
              AI suggested category: <span className="text-primary font-medium">
                {categoryDisplayNames[suggestedCategory]}
              </span>
            </p>
          )}
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
            className={errors.amount ? "border-destructive" : ""}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watch("category")}
            onValueChange={(value: ExpenseCategory) => setValue("category", value)}
          >
            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryDisplayNames[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="datetime-local"
            {...register("date")}
            className={errors.date ? "border-destructive" : ""}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recurring */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={recurring}
            onCheckedChange={(checked) => setValue("recurring", checked as boolean)}
          />
          <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
            This is a recurring expense
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {expense && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 ${expense ? "" : "w-full"}`}
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {expense ? "Update Expense" : "Add Expense"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}