import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  ...rest 
}, ref) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}  // ← Ref passado corretamente
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        {...rest}
      />
      {error && (
        <span className="mt-1 text-sm text-red-600">{error}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input