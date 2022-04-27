import { useNavigate } from 'react-router-dom'

export const ActiveCommercial = ({ activeCom }) => {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
      {/* <label>link to post: </label> */}
      <button
        style={{
          border: '0',
          background: 'none',
          color: 'blue',
          cursor: 'pointer',
          textDecoration: 'underline',
          padding: '0',
          fontSize: '16px',
        }}
        onClick={() => navigate(`/post/${activeCom.id}`)}
      >
        {activeCom.id}
      </button>
    </div>
  )
}
