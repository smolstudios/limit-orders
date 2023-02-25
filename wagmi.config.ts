import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { erc20ABI } from 'wagmi'
import ZeroEx from './abis/IZeroEx.json'
 
export default defineConfig({
  out: 'web3/generated.tsx',
  contracts: [
    {
      name: 'erc20',
      abi: erc20ABI,
    },
    {
      name: 'zeroex',
      abi: ZeroEx as any,
    },
  ],
  plugins: [
    react(),
  ],
})
