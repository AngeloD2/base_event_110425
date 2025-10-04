import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'

const WalletConnect = () => {
  const { ready, authenticated, user, login, logout, linkWallet, createWallet } = usePrivy()
  const { wallets } = useWallets()
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)

  useEffect(() => {
    console.log('ready status: ', ready)
  }, [ready])
  if (!ready) {
    return (
      <div className="w-full max-w-md">
        <div className="p-6">
          <div className="animate-pulse">Loading Web3 connection...</div>
        </div>
      </div>
    )
  }

  const handleCreateWallet = async () => {
    try {
      setIsCreatingWallet(true)
      await createWallet()
    } catch (error) {
      console.error('Error creating wallet:', error)
    } finally {
      setIsCreatingWallet(false)
    }
  }

  return (
    <div className="max-w-md bg-white p-4 rounded-lg text-black">
      <div>
        <span className="text-center text-sm">🚀 Web3 Gaming Wallet</span>
      </div>
      <div className="space-y-4">
        {!authenticated ? (
          <div className="text-center space-y-4">
            <p className="text-xs text-gray-600">
              Connect your wallet to save your high scores on-chain and compete with other players!
            </p>
            <button onClick={login} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              🔗 Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">✅ Connected!</div>
              {user?.wallet && (
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {wallets.length === 0 && (
                <button
                  onClick={handleCreateWallet}
                  disabled={isCreatingWallet}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                >
                  {isCreatingWallet ? '🔄 Creating...' : '🆕 Create Embedded Wallet'}
                </button>
              )}

              <button onClick={linkWallet} variant="outline" className="w-full">
                ➕ Link Additional Wallet
              </button>
            </div>

            {wallets.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600">Connected Wallets:</div>
                {wallets.map((wallet) => (
                  <div key={wallet.address} className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    <span className="text-gray-500 ml-2">
                      {wallet.walletClientType === 'privy' ? '🔒 Embedded' : '🌐 External'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <button onClick={logout} variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
                🚪 Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletConnect