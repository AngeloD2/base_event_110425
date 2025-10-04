import { PrivyProvider } from '@privy-io/react-auth'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const CLIENT_ID = import.meta.env.VITE_PRIVY_CLIENT_ID;

console.log('received app id: ', PRIVY_APP_ID)

const PrivyWrapper = ({ children, ...props }) => {
    return (
        <PrivyProvider
            appId={PRIVY_APP_ID}
            clientId={CLIENT_ID}
            config={{
                loginMethods: ['email'],
                appearance: {
                    theme: 'light',
                    accentColor: '#FF5F7A',
                    showWalletLoginFirst: false,
                },
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
                defaultChainId: 8453, // Base
                supportedChainIds: [1, 8453, 137, 10, 42161], // Ethereum, Base, Polygon, Optimism, Arbitrum
            }}
            {...props}
        >
            {children}
        </PrivyProvider>
    )
}

export { PrivyWrapper }