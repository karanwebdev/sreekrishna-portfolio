import React from 'react'
import { DashboardWidget } from '@sanity/dashboard'

export default function VercelDeploy({ deployHook, title }) {
  const [status, setStatus] = React.useState('idle')
  const [message, setMessage] = React.useState('')

  const handleDeploy = async () => {
    setStatus('deploying')
    setMessage('Triggering deploy...')

    try {
      const response = await fetch(deployHook, { method: 'POST' })
      
      if (response.ok) {
        setStatus('success')
        setMessage('Deploy triggered successfully! Check Vercel for progress.')
      } else {
        setStatus('error')
        setMessage('Failed to trigger deploy. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error: ' + error.message)
    }

    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <DashboardWidget header={title || 'Vercel Deploy'}>
      <div style={{ padding: '1.5em' }}>
        <p style={{ marginBottom: '1em', color: '#666', fontSize: '14px' }}>
          Click the button below to manually trigger a production deployment to Vercel.
        </p>
        
        <button
          onClick={handleDeploy}
          disabled={status === 'deploying'}
          style={{
            padding: '12px 24px',
            backgroundColor: status === 'deploying' ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: status === 'deploying' ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          {status === 'deploying' ? 'Deploying...' : '🚀 Deploy to Production'}
        </button>

        {message && (
          <div
            style={{
              marginTop: '1em',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#e7f3ff',
              color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#004085',
              fontSize: '14px',
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginTop: '1.5em', paddingTop: '1em', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
            <a
              href="https://vercel.com/exalters-projects-434e73d9/sreekrishna-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0070f3', textDecoration: 'none' }}
            >
              View deployment history →
            </a>
          </p>
        </div>
      </div>
    </DashboardWidget>
  )
}
