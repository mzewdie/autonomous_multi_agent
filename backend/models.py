from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Expense amount in currency units")
    category: str = Field(..., min_length=1, description="Category of the expense")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    description: str = Field(..., min_length=1, description="Short description of the expense")
    notes: Optional[str] = Field(None, description="Optional extra notes")

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1)
    date: Optional[str] = None
    description: Optional[str] = Field(None, min_length=1)
    notes: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True

class MonthlySummaryItem(BaseModel):
    month: str  # YYYY-MM
    total: float
    count: int

class CategorySummaryItem(BaseModel):
    category: str
    total: float
    count: int
    percentage: float

class ExpenseSummaryResponse(BaseModel):
    total_amount: float
    total_count: int
    current_month_total: float
    monthly_breakdown: List[MonthlySummaryItem]
    category_breakdown: List[CategorySummaryItem]
