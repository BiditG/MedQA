import React from 'react'

export const Select = ({ children, value, onValueChange, className }: any) => {
  return <div className={className}>{children}</div>
}

export const SelectTrigger = ({ children, className }: any) => (
  <div className={className}>{children}</div>
)

export const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>

export const SelectContent = ({ children }: any) => <div>{children}</div>

export const SelectItem = ({ value, children }: any) => (
  <div data-value={value}>{children}</div>
)

export default Select
