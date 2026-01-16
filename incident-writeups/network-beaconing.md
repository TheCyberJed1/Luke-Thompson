# Incident Writeup: Suspicious Network Beaconing Investigation

**Alert ID**: NET-2025-1423  
**Detection Date**: 2025-09-22 03:15 UTC  
**Analyst**: Luke Thompson  
**Status**: Resolved  

---

## Alert Overview

A network behavior analysis system flagged suspicious outbound traffic from an internal workstation characterized by regular, automated connections to an external IP address. The traffic pattern indicated potential command and control (C2) communication.

**Alert Details:**
- **Source Host**: EMPLOYEE-DESK-156 (10.0.2.87)
- **Destination IP**: 185.220.101.45 (suspicious external IP)
- **Destination Port**: TCP 8443
- **Protocol**: HTTPS
- **Pattern**: Beacon every 15 minutes for 8+ hours
- **Alert Rule**: "Suspicious Outbound Beaconing Pattern"
- **Severity**: High

---

## Evidence Reviewed

1. **Network Flow Logs**: NetFlow/sFlow data showing outbound connections
2. **Firewall Logs**: Egress filtering and connection termination details
3. **DNS Query Logs**: Domain resolution attempts and failures
4. **Host-Based Logs**: Process execution and network socket activity
5. **OSINT Data**: IP reputation and threat intelligence correlations

---

## Log Analysis

### Timeline of Events

| Timestamp (UTC) | Event | Source | Destination | Status |
|---|---|---|---|---|
| 2025-09-22 03:15:23 | First beacon detected | 10.0.2.87 | 185.220.101.45:8443 | Flagged |
| 2025-09-22 03:30:45 | Second beacon (15 min interval) | 10.0.2.87 | 185.220.101.45:8443 | Suspicious |
| 2025-09-22 04:15:12 | Continuous beacon pattern | 10.0.2.87 | 185.220.101.45:8443 | Confirmed |
| 2025-09-22 10:22:30 | Beaconing ceased (after isolation) | - | - | Contained |

### Network Behavior Analysis

```
Beacon Characteristics:
- Regularity: 15-minute intervals (±30 seconds deviation)
- Duration: 8+ hours of continuous activity
- Packet Size: Consistent 512-1024 byte requests
- Response Pattern: Server-side acknowledgment detected
- Data Direction: Bidirectional traffic (exfiltration risk)

Network Flow Summary:
- Total connections: 32
- Total bytes sent: 18,432
- Total bytes received: 24,576
- Connection duration: 4-8 seconds per beacon
```

### DNS Analysis

- No DNS queries for domain names detected
- Direct IP-based connections eliminate domain reputation lookup bypass
- Suggests hardcoded C2 server address in malware

### Host-Based Evidence

```
Process: svchost.exe (PID 2048)
Parent: services.exe (legitimate)
Network Activity: Outbound connections on port 8443
Execution Time: Process started 2025-09-21 22:45:00 UTC
Suspicious Behavior: Unusual outbound network access from service process
```

---

## MITRE ATT&CK Mapping

| Tactic | Technique | ID | Status |
|---|---|---|---|
| Command & Control | Application Layer Protocol (HTTPS) | T1071.001 | Confirmed |
| - | Non-Standard Port | T1571 | Observed |
| Exfiltration | Exfiltration Over C2 Channel | T1041 | Suspected |
| Persistence | Create or Modify System Process | T1547.001 | Indicated |

**Framework Context**: The behavior is consistent with RAT (Remote Access Trojan) or backdoor malware establishing command and control communication with an external threat actor.

---

## OSINT Enrichment

### IP Reputation Analysis

**IP**: 185.220.101.45

| Source | Status | Risk | Last Seen |
|---|---|---|---|
| AbuseIPDB | Malicious | High | 2025-09-22 |
| AlienVault OTX | Malware C2 | Confirmed | 2025-09-20 |
| CIRCL.lu | Known Botnet | Emotet C2 | 2025-09-19 |
| Shodan | Port 8443 Open | C2 Server | 2025-09-18 |

### Threat Intelligence Summary

- **IP Registration**: Hosting provider with history of abuse
- **ASN**: Bulletproof Hosting network known for harboring malicious activity
- **Historical Activity**: Connected to Emotet banking trojan infrastructure
- **Concurrent Beacons**: 127 other IP addresses showing similar beacon patterns

### Malware Analysis

- **File Hash**: SHA256 analysis of suspicious binary in progress
- **Known Variants**: Similar beacon patterns observed in Emotet samples from June 2025
- **Family**: Likely banking trojan or information stealer

---

## Determination

**Classification: TRUE POSITIVE (TP)**

**Reasoning:**
1. Network behavior is consistent with confirmed malware C2 communication
2. Destination IP has established reputation in threat intelligence databases
3. Beacon pattern (regular intervals, bidirectional data) rules out legitimate application behavior
4. Data suggests possible credential theft or information exfiltration
5. Manual analysis of host confirms suspicious process and execution context

---

## Response Actions

### Immediate Actions (Within 1 Hour)

1. **Isolated EMPLOYEE-DESK-156** from the network to prevent data exfiltration
2. **Blocked IP 185.220.101.45** at firewall and IDS/IPS devices
3. **Alerted System Owner**: Notified employee and manager of incident
4. **Preserved Evidence**: Full memory dump and disk image captured before any cleaning

### Investigation Phase

1. **Forensic Analysis**: Deep analysis of malware, execution history, and persistence mechanisms
2. **Credential Audit**: Reset all passwords for user accounts on affected workstation
3. **Data Access Review**: Identified files accessed and potentially exfiltrated
4. **Timeline Reconstruction**: Determined infection vector (email, drive-by download, etc.)

### Containment & Remediation

1. **Malware Removal**: Used EDR tool to quarantine and remove malicious processes
2. **System Rebuild**: Clean OS installation after forensic evidence collection
3. **Credential Reset**: All administrative and service account credentials changed
4. **Firewall Blocking**: Added IP range and domain indicators to block list

### Communication

1. Notified user of incident and requested action
2. Updated management and compliance team
3. Documented incident for regulatory reporting (if required)

---

## Lessons Learned

### What Went Well

1. **Alert Detection**: Network monitoring successfully identified abnormal beaconing pattern
2. **Rapid Response**: Incident response team isolated host within 45 minutes of alert
3. **Evidence Preservation**: Full forensic capture enabled root cause analysis
4. **Threat Intelligence Integration**: OSINT feeds immediately identified C2 server

### Areas for Improvement

1. **Detection Latency**: 3+ hours elapsed before alert triggered - consider reducing threshold
2. **Endpoint Visibility**: Host-based indicators (process execution) could have flagged earlier
3. **User Awareness**: Likely infection vector was phishing email - stronger filtering needed
4. **Patching Cadence**: Workstation was 14 days behind on security patches

### Recommendations

- **Improve Email Security**: Deploy advanced email threat protection with sandboxing
- **Enhance EDR Monitoring**: Enable real-time behavioral analysis on all endpoints
- **Network Segmentation**: Isolate user workstations from sensitive data resources
- **Privileged Access Management**: Restrict administrative access on employee workstations
- **User Training**: Conduct security awareness training on phishing and malware risks
- **Threat Intelligence Feeds**: Update SIEM with latest C2 server indicators

### Policy Updates

- **Incident Response Plan**: Add step for immediate credential rotation after malware detection
- **Baseline Metrics**: Define normal outbound traffic patterns per department
- **Acceptable Use Policy**: Strengthen guidelines on external network connections

---

## Follow-Up Actions

- [ ] Complete forensic analysis and generate detailed findings report
- [ ] Interview employee to identify infection vector (phishing email, website, etc.)
- [ ] Scan organization for similar malware signatures
- [ ] Verify credential rotation completed across all affected accounts
- [ ] Implement EDR on 50% of remaining unmonitored workstations
- [ ] Schedule mandatory security awareness training for affected department
- [ ] Review and update firewall rules quarterly based on threat intelligence

---

**Incident Status**: Closed  
**Root Cause**: Emotet trojan delivered via spear-phishing email  
**Report Date**: 2025-09-22  
**Review Date**: 2025-09-24  
**Regulatory Notification**: None required (no PII accessed)
