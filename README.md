# Anonymous Blockchain Chat System

A decentralized anonymous messaging platform built on Ethereum, enabling secure and private communications through blockchain technology.

## Overview

The Anonymous Blockchain Chat System is a decentralized application (DApp) that provides a secure platform for anonymous communication. Built using Ethereum smart contracts and React, the system ensures message integrity and sender authenticity while maintaining user privacy through blockchain addresses rather than traditional identifiers.

## Features

The system provides robust messaging capabilities while maintaining user privacy:

- Anonymous messaging using Ethereum addresses
- Permanent message storage on the blockchain
- Real-time message updates through blockchain events
- Message history tracking and retrieval
- User-friendly interface built with React and Tailwind CSS
- MetaMask integration for secure transactions
- Gas optimization for cost-effective messaging

## Prerequisites

Before installation, ensure you have the following installed:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Truffle Suite
- Ganache
- MetaMask browser extension

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/anonymous-blockchain-chat.git
cd anonymous-blockchain-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start Ganache and ensure it's running on port 7545

4. Deploy the smart contract:
```bash
truffle migrate --network development
```

5. Note the deployed contract address and update it in src/components/Chat.jsx:
```javascript
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

6. Start the development server:
```bash
npm start
```

## Configuration

### MetaMask Setup

1. Open MetaMask and connect to Ganache:
   - Network Name: Ganache
   - RPC URL: http://127.0.0.1:7545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import a Ganache account into MetaMask using the private key

### Smart Contract

The smart contract is deployed on the Ganache network. For custom deployments, modify truffle-config.js as needed:

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
```

## Usage

1. Open the application in your browser (typically http://localhost:3000)
2. Connect your MetaMask wallet when prompted
3. Start sending and receiving messages anonymously

The interface will display messages with truncated sender addresses to maintain privacy while ensuring message authenticity.

## Development

### Running Tests

Execute the test suite:
```bash
truffle test
```

### Linting

Run the linter:
```bash
npm run lint
```

## Troubleshooting

Common issues and solutions:

1. MetaMask Connection Issues
   - Ensure Ganache is running
   - Verify network configuration in MetaMask
   - Check if the correct account is selected

2. Transaction Failures
   - Confirm sufficient ETH in your account
   - Check gas price and limit settings
   - Verify contract address configuration

## Security Considerations

The system implements several security measures:

- All messages are stored on the blockchain, ensuring immutability
- Sender addresses are verified cryptographically
- No personal information is stored
- Message length validation prevents spam
- Gas limits protect against network abuse

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and queries:

- Open an issue in the GitHub repository
- Contact the development team at: [contact information]
- Check the documentation at: [documentation URL]

## Acknowledgments

- OpenZeppelin for smart contract security patterns
- Truffle Suite for development tools
- React community for frontend components
- Ethereum community for blockchain infrastructure

---

*This project is under active development. Please report any issues or suggestions.*