export const PendingCommercial = ({ pendingCom }) => {
  return (
    <>
      <div>
        <label>id: </label> <span>{pendingCom.id}</span>
      </div>
      <div style={{ maxWidth: '200px', wordBreak: 'break-word', margin: 'auto' }}>
        <label>uri: </label> <span>{pendingCom.uri}</span>
      </div>
      <div>
        <label>current / charges: </label>
        <span>
          {pendingCom.currentComCount} / {pendingCom.maxComCount}
        </span>
      </div>
      <div>
        <label>gwei: </label>
        <span>{pendingCom.balance}</span>
      </div>
    </>
  )
}
