// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AnonChat {
    struct User {
        string username;
        bool exists;
    }
    
    struct Message {
        bytes32 sender;
        string senderName;
        string content;
        uint256 timestamp;
    }
    
    Message[] public messages;
    mapping(bytes32 => bool) public usedHashes;
    mapping(address => User) public users;
    
    event NewMessage(bytes32 indexed sender, string senderName, string content, uint256 timestamp);
    event UserRegistered(address user, string username);
    
    function register(string memory username) public {
        require(!users[msg.sender].exists, "User already registered");
        users[msg.sender] = User(username, true);
        emit UserRegistered(msg.sender, username);
    }
    
    function sendMessage(bytes32 senderHash, string memory content) public {
        require(users[msg.sender].exists, "User not registered");
        require(!usedHashes[senderHash], "Hash already used");
        
        usedHashes[senderHash] = true;
        messages.push(Message(senderHash, users[msg.sender].username, content, block.timestamp));
        emit NewMessage(senderHash, users[msg.sender].username, content, block.timestamp);
    }
    
    function getMessages() public view returns (Message[] memory) {
        return messages;
    }
    
    function getUser(address userAddress) public view returns (string memory) {
        require(users[userAddress].exists, "User not found");
        return users[userAddress].username;
    }
}
