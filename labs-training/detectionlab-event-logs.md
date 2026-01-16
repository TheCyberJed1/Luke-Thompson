# Lab: DetectionLab Windows Event Log Analysis

**Lab Name**: DetectionLab (Malware Traffic Analysis)  
**Completion Date**: September 2025  
**Platform**: DetectionLab (Open-source environment)  
**Duration**: 20+ hours of practical exercises

---

## Lab Overview

DetectionLab is a virtualized environment simulating a realistic Windows domain infrastructure. The lab provides raw malware traffic captures and Windows event logs for hands-on analysis and threat detection development.

**Lab Scope**: Enterprise Windows event log analysis, malware behavior detection, and incident response

---

## Environment Configuration

### Network Architecture

```
Internet (Simulated)
    ↓
Firewall (pfSense)
    ↓
Windows Domain
    ├── DC01 (Domain Controller)
    ├── WS01 (Victim Workstation)
    └── WS02 (Analysis Workstation)
```

### Systems Analyzed

- **Domain Controller (DC01)**: Windows Server 2019, SIEM target
- **Infected Workstation (WS01)**: Windows 10 Enterprise, malware execution target
- **Analysis Workstation (WS02)**: Kali Linux, analysis tools

---

## Exercises Completed

### Exercise 1: Baseline Event Log Establishment

**Objective**: Create baseline for normal Windows security event activity

**Tasks**:
1. Captured 24 hours of "clean" Windows Event Log data
2. Identified normal authentication patterns and frequencies
3. Documented baseline for key event IDs:
   - Event ID 4624 (Successful Login)
   - Event ID 4628 (Group Membership)
   - Event ID 5156 (Network Connection Allowed)

**Key Findings**:
- Average authentication events: 150-200/hour during business hours
- Normal network connectivity: Primary Domain Controller and file servers
- Legitimate service accounts: System, NETWORK SERVICE, LOCAL SERVICE

**Application**: Used baseline to detect anomalies in real alerts (brute-force writeup)

---

### Exercise 2: Detecting Lateral Movement via Event Logs

**Objective**: Identify lateral movement indicators in Windows event logs

**Attack Scenario**: Attacker compromises WS01, attempts lateral movement to DC01

**Detection Methods**:
1. **Event ID 4768**: Kerberos TGT Request (unusual service accounts requesting TGT)
2. **Event ID 4769**: Kerberos Service Ticket Request (targeting domain controller services)
3. **Event ID 4688**: Process Creation (suspicious process execution from lateral tools)
4. **Event ID 5140**: Network Share Access (unexpected share connections)

**Analysis Results**:

```
Timeline of Lateral Movement Attempt:
13:45:22 - Attacker executes psexec.exe on WS01
13:45:23 - Event ID 4688: psexec.exe created (parent: cmd.exe)
13:45:24 - Event ID 5140: Attempted connection to \\DC01\IPC$
13:45:25 - Event ID 4768: TGT requested for SYSTEM account (anomalous)
13:45:26 - Event ID 4769: Service ticket requested for cifs service
13:45:27 - Network-level authentication failure detected
```

**Lessons Learned**:
- Lateral movement leaves distinctive event log signatures
- Multi-event correlation is essential for detection
- Timeline reconstruction reveals attacker intent and methodology

---

### Exercise 3: Malware Process Execution Analysis

**Objective**: Detect malware execution through process creation events

**Malware Sample**: Emotet trojan (simulated in controlled environment)

**Key Event IDs Analyzed**:
- **Event ID 4688**: Process creation (parent-child relationships)
- **Event ID 4689**: Process termination
- **Event ID 4703**: Token Right Adjustment
- **Event ID 10**: Process Access (Sysmon event)

**Suspicious Process Chain Identified**:

```
Parent: explorer.exe (PID 2048)
  └─ Child: cmd.exe (PID 3156)
      └─ Grandchild: powershell.exe (PID 4204)
          └─ Arguments: -enc [base64 obfuscated payload]
              └─ Network Connection: outbound to 185.220.101.45:8443
```

**Detection Indicators**:
- PowerShell execution with suspicious arguments
- Process spawning from explorer.exe (user context escalation)
- Direct port connection from PowerShell (C2 communication)

---

### Exercise 4: Authentication Anomaly Detection

**Objective**: Identify credential compromise and brute-force attacks

**Scenario**: Dictionary attack against domain administrator account

**Event IDs Analyzed**:
- **Event ID 4625**: Failed Logon Attempt
- **Event ID 4771**: Kerberos Pre-authentication Failed
- **Event ID 4624**: Successful Logon (post-compromise access)

**Analysis Results**:

| Time | Event ID | Status | Details |
|---|---|---|---|
| 14:00:01 | 4625 | Failed | admin@domain.com - Invalid password |
| 14:00:15 | 4625 | Failed | admin@domain.com - Invalid password |
| 14:00:29 | 4625 | Failed | admin@domain.com - Invalid password |
| 14:00:43 | 4625 | Failed | admin@domain.com - Invalid password |
| 14:01:00 | 4624 | Success | admin@domain.com - SUCCESSFUL LOGON |

**Findings**:
- 47 failed attempts over 8-minute period
- Successful compromise following brute-force attack
- Account lockout policy not configured (vulnerability)

---

### Exercise 5: Data Exfiltration Detection

**Objective**: Identify suspicious file access and data transfer patterns

**Detection Methods**:
1. **File Access Auditing**: Monitor sensitive file access (Event ID 4663)
2. **Network Monitoring**: Track large data transfers outbound
3. **Process Behavior**: Identify processes accessing unusual files

**Suspicious Activity Detected**:

```
Event ID 4663: File Read Access
Source Process: powershell.exe (attacker-controlled)
Target Files:
  - C:\Users\Administrator\Desktop\credentials.txt
  - C:\Users\Finance\Documents\2025_budgets.xlsx
  - C:\Users\HR\Documents\employee_database.accdb

Network Activity (Sysmon Event 3):
Source: WS01 (10.0.2.50)
Destination: 192.168.1.100:443
Bytes Sent: 12.4 MB (suspicious volume)
Duration: 45 seconds
Data Pattern: Binary (encrypted/obfuscated transmission)
```

**Response Actions**:
- Immediately blocked outbound connections from WS01
- Isolated workstation from network
- Preserved evidence for forensic analysis

---

## Tools & Techniques Utilized

### Event Log Analysis Tools

- **Event Viewer**: Native Windows log examination
- **PowerShell**: Log parsing and filtering (`Get-EventLog`, `Get-WinEvent`)
- **Logparser**: Advanced SQL-like queries on log files
- **Splunk**: Centralized log aggregation and analysis

### Analysis Techniques

1. **Timeline Analysis**: Chronological reconstruction of events
2. **Correlation**: Connecting related events across multiple logs
3. **Baseline Comparison**: Deviation from normal activity
4. **Threat Intelligence Integration**: Cross-referencing known indicators

### Sample PowerShell Queries

```powershell
# Detect brute-force attempts
Get-WinEvent -FilterHashtable @{
  LogName='Security'
  ID=4625
  StartTime=(Get-Date).AddHours(-1)
} | Group-Object -Property TargetUserName | Where-Object {$_.Count -gt 5}

# Find lateral movement attempts
Get-WinEvent -FilterHashtable @{
  LogName='Security'
  ID=4768
  StartTime=(Get-Date).AddDays(-1)
} | Where-Object {$_.Properties[4].Value -notmatch 'krbtgt|computer$'}

# Identify suspicious process creation
Get-WinEvent -FilterHashtable @{
  LogName='Security'
  ID=4688
  StartTime=(Get-Date).AddHours(-8)
} | Where-Object {$_.Properties[5].Value -match 'powershell|cmd|psexec'}
```

---

## Practical Skills Developed

### Event Log Mastery

✅ Understand Windows event structure and classification  
✅ Identify critical event IDs for security investigations  
✅ Parse complex event data and extract relevant fields  
✅ Create correlation queries across multiple events  
✅ Develop baseline metrics for anomaly detection  

### Incident Response

✅ Rapidly triage security events  
✅ Reconstruct attack timelines  
✅ Identify compromise indicators  
✅ Determine scope of breach  
✅ Document findings professionally  

### Malware Analysis Foundations

✅ Recognize malware execution patterns  
✅ Identify command and control communication  
✅ Detect process injection and persistence mechanisms  
✅ Correlate behavioral indicators  

---

## Key Discoveries

### Critical Event IDs for SOC

| Event ID | Purpose | Alert Threshold |
|---|---|---|
| 4625 | Failed Logon | >5 in 5 minutes (per account) |
| 4624 | Successful Logon | Baseline comparison (geographic, time) |
| 4768 | Kerberos TGT Request | Unusual service accounts |
| 4769 | Kerberos Service Ticket | Delegation abuse detection |
| 4688 | Process Creation | Parent-child relationship analysis |
| 4663 | File Access | Sensitive directory monitoring |
| 5156 | Network Connection | C2 and exfiltration detection |

### Common Attacker Patterns

1. **Initial Access**: Spear-phishing or credential compromise
2. **Lateral Movement**: Use of compromised credentials to access other systems
3. **Persistence**: Registry modifications, scheduled tasks, service creation
4. **Data Exfiltration**: Bulk file access and network transfers
5. **Cleanup**: Event log clearing and artifact deletion

---

## Real-World Application

### Direct Translation to Incidents

These lab exercises informed the analysis of actual security incidents:

- **Brute Force Writeup** (SEC-2025-0847): Applied Event ID 4625 analysis directly
- **Malware Analysis** (MAL-2025-0921): Used process creation chain analysis from Exercise 3
- **Network Beaconing** (NET-2025-1423): Combined network analysis with timeline reconstruction

### Ongoing Improvement

- Refined SIEM alert rules based on lab findings
- Developed custom PowerShell scripts for log parsing
- Created detection rules for known attack patterns
- Established baseline metrics for anomaly detection

---

## Recommendations

1. **Advanced Malware Analysis**: Progress to kernel-level malware analysis
2. **Network Forensics**: Deepen Wireshark and network packet analysis skills
3. **Threat Hunting**: Develop proactive hunting queries and methodologies
4. **Lab Expansion**: Build isolated home lab for continuous practice
5. **Certification**: Apply skills toward CompTIA Security+ and GIAC certifications

---

**Lab Status**: Completed - Core modules  
**Next Steps**: Progress to advanced malware analysis and threat hunting modules  
**Last Updated**: September 2025
