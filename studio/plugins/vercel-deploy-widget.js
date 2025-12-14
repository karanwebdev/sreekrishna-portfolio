import React from 'react'
import { DashboardWidget } from '@sanity/dashboard'

const VercelDeployWidget = ({ deployHook, title }) => {
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
      <div style={{ padding: '1em' }}>
        <p style={{ marginBottom: '1em', color: '#666' }}>
          This site is a static build deployed on Vercel. Click Deploy to manually trigger a rebuild.
        </p>
        
        <button
          onClick={handleDeploy}
          disabled={status === 'deploying'}
          style={{
            padding: '10px 20px',
            backgroundColor: status === 'deploying' ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: status === 'deploying' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {status === 'deploying' ? 'Deploying...' : '🚀 Deploy to Vercel'}
        </button>

        {message && (
          <p
            style={{
              marginTop: '1em',
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: status === 'success' ? '#d4edda' : status === 'error' ? '#f8d7da' : '#e7f3ff',
              color: status === 'success' ? '#155724' : status === 'error' ? '#721c24' : '#004085',
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: '1em', fontSize: '12px', color: '#999' }}>
          <a
            href="https://vercel.com/exalters-projects-434e73d9/sreekrishna-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0070f3' }}
          >
            View deployments on Vercel →
          </a>
        </p>
      </div>
    </DashboardWidget>
  )
}

export default VercelDeployWidget
