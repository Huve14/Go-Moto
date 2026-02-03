'use client'

import * as React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface FormFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  className?: string
}

interface InputFieldProps extends FormFieldProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'password'
  placeholder?: string
  autoComplete?: string
}

export function FormInput({
  name,
  label,
  description,
  required,
  type = 'text',
  placeholder,
  autoComplete,
  className,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...register(name, { valueAsNumber: type === 'number' })}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface TextareaFieldProps extends FormFieldProps {
  placeholder?: string
  rows?: number
}

export function FormTextarea({
  name,
  label,
  description,
  required,
  placeholder,
  rows = 4,
  className,
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...register(name)}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface SelectFieldProps extends FormFieldProps {
  options: { value: string; label: string }[]
  placeholder?: string
}

export function FormSelect({
  name,
  label,
  description,
  required,
  options,
  placeholder = 'Select an option',
  className,
}: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger id={name} aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface CheckboxFieldProps extends FormFieldProps {
  checkboxLabel: string
}

export function FormCheckbox({
  name,
  label,
  description,
  checkboxLabel,
  className,
}: CheckboxFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!error}
            />
            <Label
              htmlFor={name}
              className="text-sm font-normal cursor-pointer"
            >
              {checkboxLabel}
            </Label>
          </div>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}

interface RadioFieldProps extends FormFieldProps {
  options: { value: string; label: string; description?: string }[]
}

export function FormRadio({
  name,
  label,
  description,
  required,
  options,
  className,
}: RadioFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="space-y-2"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
