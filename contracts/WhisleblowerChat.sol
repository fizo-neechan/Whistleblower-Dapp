// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WhistleblowerChat {
    enum ReportStatus { Submitted, UnderReview, Resolved, Dismissed }
    enum ReportCategory { Ethics, Financial, Harassment, Safety, Other }
    
    struct Report {
        bytes32 reportId;
        bytes32 employeeProof;
        ReportCategory category;
        string content;
        string evidenceHash;  // IPFS hash
        uint256 timestamp;
        ReportStatus status;
        string[] responses;
    }
    
    struct Organization {
        string name;
        bytes32 orgHash;
        mapping(bytes32 => bool) validEmployeeHashes;
    }
    
    mapping(address => bool) public admins;
    mapping(bytes32 => Organization) public organizations;
    mapping(bytes32 => Report) public reports;
    bytes32[] public reportIds;
    
    event ReportSubmitted(bytes32 indexed reportId, ReportCategory category);
    event ReportStatusUpdated(bytes32 indexed reportId, ReportStatus status);
    event ResponseAdded(bytes32 indexed reportId, string response);
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Not authorized");
        _;
    }
    


    // Add this to constructor
    constructor() {
        admins[msg.sender] = true;
    }

    function forceAdmin(address account) public {
    admins[account] = true;
    }

    function isAdmin(address account) public view returns (bool) {
        return admins[account];
    }

    // Optional: Function to add more admins
    function addAdmin(address newAdmin) public {
        require(admins[msg.sender], "Not admin");
        admins[newAdmin] = true;
    }
    
    function registerOrganization(
        string memory name,
        bytes32[] memory employeeHashes
    ) public onlyAdmin {
        bytes32 orgHash = keccak256(abi.encodePacked(name));
        for(uint i = 0; i < employeeHashes.length; i++) {
            organizations[orgHash].validEmployeeHashes[employeeHashes[i]] = true;
        }
        organizations[orgHash].name = name;
        organizations[orgHash].orgHash = orgHash;
    }
    
    function submitReport(
        bytes32 orgHash,
        bytes32 employeeProof,
        ReportCategory category,
        string memory content,
        string memory evidenceHash
    ) public {
        require(organizations[orgHash].validEmployeeHashes[employeeProof], 
                "Invalid employee proof");
        
        bytes32 reportId = keccak256(abi.encodePacked(block.timestamp, content, msg.sender));
        reports[reportId] = Report(
            reportId,
            employeeProof,
            category,
            content,
            evidenceHash,
            block.timestamp,
            ReportStatus.Submitted,
            new string[](0)
        );
        reportIds.push(reportId);
        
        emit ReportSubmitted(reportId, category);
    }
    
    function addResponse(bytes32 reportId, string memory response) public onlyAdmin {
        reports[reportId].responses.push(response);
        emit ResponseAdded(reportId, response);
    }
    
    function updateStatus(bytes32 reportId, ReportStatus status) public onlyAdmin {
        reports[reportId].status = status;
        emit ReportStatusUpdated(reportId, status);
    }
    
    function getReport(bytes32 reportId) public view returns (
        bytes32,
        ReportCategory,
        string memory,
        string memory,
        uint256,
        ReportStatus,
        string[] memory
    ) {
        Report storage report = reports[reportId];
        return (
            report.reportId,
            report.category,
            report.content,
            report.evidenceHash,
            report.timestamp,
            report.status,
            report.responses
        );
    }
    
    function getAllReports() public view returns (bytes32[] memory) {
        return reportIds;
    }

    function reviewReport(bytes32 reportId, bool approved, string memory feedback) public {
        require(admins[msg.sender], "Not admin");
        Report storage report = reports[reportId];
        report.status = approved ? ReportStatus.Resolved : ReportStatus.Dismissed;
        report.responses.push(feedback);
        emit ReportStatusUpdated(reportId, report.status);
    }
}
