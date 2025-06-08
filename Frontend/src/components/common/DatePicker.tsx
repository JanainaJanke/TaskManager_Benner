import React, { forwardRef } from 'react'

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showTime?: boolean
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({ 
  label, 
  error,
  required = false,
  disabled = false,
  className = '',
  showTime = false,
  ...rest 
}, ref) => {
  // Função para formatar data atual para input[type="date"] - SEM problemas de timezone
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Função para formatar datetime-local
  const getCurrentDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={showTime ? "datetime-local" : "date"}
        min={showTime ? getCurrentDateTime() : getCurrentDate()}
        disabled={disabled}
        required={required}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${
          required ? 'border-blue-300' : ''
        }`}
        {...rest}
      />
      
      {error && (
        <span className="mt-1 text-sm text-red-600">{error}</span>
      )}
      
      <span className="mt-1 text-xs text-gray-500">
        {showTime ? 'Selecione data e horário' : 'Selecione a data de vencimento'}
      </span>
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker