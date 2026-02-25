/**
 * Feature: ai-learning-platform, Property 20: 加载状态可见性
 * Validates: Requirements 13.4
 * 
 * Property: 对于任意需要处理时间的操作，系统应该显示清晰的加载状态和进度指示
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingOverlay from '../components/LoadingOverlay'
import ProgressBar from '../components/ProgressBar'
import Button from '../components/Button'

describe('Property 20: 加载状态可见性', () => {
  it('LoadingSpinner should be visible when rendered', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    
    sizes.forEach(size => {
      const { container } = render(<LoadingSpinner size={size} />)
      
      // Verify spinner element exists
      const spinner = container.querySelector('div[class*="border"]')
      expect(spinner).toBeTruthy()
    })
  })

  it('LoadingOverlay should display loading message when active', () => {
    const testMessage = '正在加载数据...'
    
    const { rerender } = render(
      <LoadingOverlay isLoading={false} message={testMessage} />
    )
    
    // Should not be visible when isLoading is false
    expect(screen.queryByText(testMessage)).not.toBeInTheDocument()
    
    // Should be visible when isLoading is true
    rerender(<LoadingOverlay isLoading={true} message={testMessage} />)
    expect(screen.getByText(testMessage)).toBeInTheDocument()
  })

  it('ProgressBar should display progress percentage correctly', () => {
    const progressValues = [0, 25, 50, 75, 100]

    
    progressValues.forEach(progress => {
      const { rerender } = render(
        <ProgressBar progress={progress} showPercentage={true} />
      )
      
      // Verify percentage is displayed
      expect(screen.getByText(`${progress}%`)).toBeInTheDocument()
      
      // Test with different progress values
      const newProgress = Math.min(progress + 10, 100)
      rerender(<ProgressBar progress={newProgress} showPercentage={true} />)
      expect(screen.getByText(`${newProgress}%`)).toBeInTheDocument()
    })
  })

  it('ProgressBar should handle out-of-range values correctly', () => {
    // Test values outside 0-100 range
    const { rerender } = render(<ProgressBar progress={-10} showPercentage={true} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
    
    rerender(<ProgressBar progress={150} showPercentage={true} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('ProgressBar should display label when provided', () => {
    const label = '上传进度'
    render(<ProgressBar progress={50} label={label} />)
    
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('Button should show loading state when loading prop is true', () => {
    const { rerender } = render(
      <Button loading={false}>提交</Button>
    )
    
    // Button should be enabled when not loading
    const button = screen.getByText('提交')
    expect(button).not.toBeDisabled()
    
    // Button should be disabled when loading
    rerender(<Button loading={true}>提交</Button>)
    expect(button).toBeDisabled()
  })

  it('LoadingOverlay should support both fullScreen and relative positioning', () => {
    const { rerender } = render(
      <div style={{ position: 'relative', height: '200px' }}>
        <LoadingOverlay isLoading={true} fullScreen={false} />
      </div>
    )
    
    // Test relative positioning
    expect(screen.getByText('加载中...')).toBeInTheDocument()
    
    // Test fullScreen positioning
    rerender(
      <div style={{ position: 'relative', height: '200px' }}>
        <LoadingOverlay isLoading={true} fullScreen={true} />
      </div>
    )
    
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })
})
