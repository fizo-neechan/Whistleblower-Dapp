/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhistleblowerChatABI from './artifacts/WhistleblowerChat.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

enum ReportCategory {
  Ethics,
  Financial,
  Harassment,
  Safety,
  Other
}

enum ReportStatus {
  Submitted,
  UnderReview,
  Resolved,
  Dismissed
}

interface Report {
  reportId: string;
  category: ReportCategory;
  content: string;
  status: ReportStatus;
  evidenceHash?: string;
  responses: string[];
}

const WhistleblowerApp = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [newReport, setNewReport] = useState({
    category: ReportCategory.Ethics,
    content: '',
    evidence: null as File | null
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [organizationHash, setOrganizationHash] = useState('0x0000000000000000000000000000000000000000');

  useEffect(() => {
    initWeb3();
  }, []);

  async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x539') {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }],
          });
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x32c7E87B874d9527975eb195A0aF226c9c76c768";
        const chatContract = new ethers.Contract(
          contractAddress,
          WhistleblowerChatABI.abi,
          signer
        );
        setContract(chatContract);

        // Check if user is registered
        try {
          const address = await signer.getAddress();


          // Check admin status
          const isAdminStatus = await chatContract.isAdmin(address);
          setIsAdmin(isAdminStatus);

          console.log("Admin status:", isAdminStatus);  // Debug log

          const username = await chatContract.getUser(address);
          setUsername(username);
          setIsRegistered(true);
        } catch (error) {
          setIsRegistered(false);
        }

        // loadMessages();
        loadReports();
        // setLoading(false);
      } catch (error) {
        console.error("Error initializing Web3:", error);
      }
    }
  }

  async function makeAdmin() {
    if (!contract) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    await contract.forceAdmin(address);
    setIsAdmin(true);
  }



  async function submitReport() {
    if (!contract || !newReport.content) return;

    try {
      let evidenceHash = '';
      if (newReport.evidence) {
        const ipfs = create();
        const added = await ipfs.add(newReport.evidence);
        evidenceHash = added.path;
      }

      const employeeProof = ethers.id("employee1"); // Fixed employee proof
      const orgHash = ethers.id("TestOrg"); // Fixed org hash

      await contract.submitReport(
        orgHash,
        employeeProof,
        newReport.category,
        newReport.content,
        evidenceHash
      );

      setNewReport({ category: ReportCategory.Ethics, content: '', evidence: null });
      loadReports();
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  }

  async function registerOrg() {
    if (!contract) return;
    const orgHash = ethers.id("TestOrg");
    const employeeProof = ethers.id("employee1");
    await contract.registerOrganization("TestOrg", [employeeProof]);
  }

  async function loadReports() {
    if (!contract) return;

    try {
      const reportIds = await contract.getAllReports();
      const reportsData = await Promise.all(
        reportIds.map(async (id: string) => {
          const report = await contract.getReport(id);
          return {
            reportId: id,
            category: report[1],
            content: report[2],
            evidenceHash: report[3],
            timestamp: Number(report[4]),
            status: report[5],
            responses: report[6]
          };
        })
      );
      setReports(reportsData);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  }

  function AdminPanel() {
    useEffect(() => {
      loadReports();
    }, []);

    if (!isAdmin) return null;

    async function handleReview(reportId: string, approved: boolean) {
      const feedback = prompt("Enter feedback:");
      if (!feedback) return;

      try {
        if (!contract) return;
        await contract.reviewReport(reportId, approved, feedback);
        // Refresh reports
        await loadReports();
      } catch (error) {
        console.error("Error reviewing report:", error);
      }
    }

    return (
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        {reports.map(report => (
          <div key={report.reportId} className="mb-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {ReportCategory[report.category]}
              </span>
              {ReportStatus[report.status] !== 'Resolved' && ReportStatus[report.status] !== 'Dismissed' && (
                <>
                  <button
                    onClick={() => handleReview(report.reportId, true)}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(report.reportId, false)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>

            <p className="mt-2">{report.content}</p>
          </div>
        ))
        }
      </div >
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Whistleblower Reports</CardTitle>
          <button
            onClick={registerOrg}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Register Organization
          </button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <select
              value={newReport.category}
              onChange={(e) => setNewReport({
                ...newReport,
                category: parseInt(e.target.value)
              })}
              className="w-full p-2 mb-4 border rounded"
            >
              {Object.keys(ReportCategory)
                .filter(k => !isNaN(Number(k)))
                .map((category) => (
                  <option key={category} value={category}>
                    {ReportCategory[Number(category)]}
                  </option>
                ))
              }
            </select>

            <textarea
              value={newReport.content}
              onChange={(e) => setNewReport({
                ...newReport,
                content: e.target.value
              })}
              className="w-full p-2 mb-4 border rounded"
              rows={4}
              placeholder="Describe the issue..."
            />

            <input
              type="file"
              onChange={(e) => setNewReport({
                ...newReport,
                evidence: e.target.files?.[0] ?? null
              })}
              className="mb-4"
            />

            <button
              onClick={submitReport}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit Report
            </button>
          </div>

          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.reportId} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">
                    {ReportCategory[report.category]}
                  </span>
                  <span className="text-gray-500">
                    {ReportStatus[report.status]}
                  </span>
                </div>
                <p className="mb-2">{report.content}</p>
                {report.evidenceHash && (
                  <a
                    href={`https://ipfs.io/ipfs/${report.evidenceHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    View Evidence
                  </a>
                )}
                {report.responses.map((response, i) => (
                  <div key={i} className="mt-2 pl-4 border-l-2">
                    {response}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isAdmin && <>
        <AdminPanel />
      </>
      }
      <div className='w-full'>
      <button onClick={makeAdmin} className="mx-auto mt-2 px-4 py-2 bg-blue-500 text-white rounded ml-2">
        Make Admin
      </button>
      </div>
    </div>
  );
};

export default WhistleblowerApp;