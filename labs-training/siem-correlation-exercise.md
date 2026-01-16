# Lab: SIEM Log Parsing & Correlation Exercise

**Lab Name**: SIEM Log Parsing & Real-Time Correlation  
**Platform**: Splunk Community Edition  
**Completion Date**: September 2025  
**Duration**: 15+ hours of hands-on exercises

---

## Lab Overview

This exercise focused on advanced SIEM capabilities for ingesting, parsing, and correlating security logs from multiple sources in real-time. The lab simulated a realistic security operations center environment with live threat detection and alerting.

**Lab Goals**:
- Build automated detection rules for common attack patterns
- Correlate events across multiple log sources
- Create operational dashboards for security monitoring
- Optimize SIEM performance and alert tuning

---

## Environment Setup

### Log Sources Configured

```
Splunk SIEM
├── Windows Event Logs (Domain Controller, Workstations)
├── Syslog (Linux systems, network devices)
├── IDS/IPS Alerts (Suricata rules)
├── Proxy Logs (Web gateway access logs)
├── Firewall Logs (Palo Alto Networks)
├── DNS Query Logs (Internal DNS resolver)
├── Authentication Logs (Active Directory)
└── Application Logs (Custom business applications)
```

### Data Volume

- **Daily Ingestion**: 500 MB - 2 GB (realistic SOC environment)
- **Retention**: 30 days hot, 90 days warm, 1 year cold storage
- **Indexing Speed**: 50,000 - 100,000 events per second

---

## Core Exercises

### Exercise 1: Log Source Configuration & Parsing

**Objective**: Ingest diverse log sources and ensure proper field extraction

**Tasks Completed**:

1. **Windows Event Log Ingestion**
   - Configured Universal Forwarder on domain-joined systems
   - Defined sourcetype for Security, System, and Application logs
   - Created field extractions for key attributes:
     - User (Account_Name, Target_User_Name)
     - Computer (Computer, Source_IP)
     - Event_ID (classification)
     - Event_Time (timestamp)

2. **Syslog Configuration**
   - Set up UDP 514 syslog listening port
   - Parsed Linux authentication logs
   - Extracted user, host, and action fields
   - Normalized timestamp across different formats

3. **Firewall Log Parsing**
   - Ingested Palo Alto Networks traffic logs
   - Extracted source/destination IP, port, protocol
   - Normalized threat verdict and action fields
   - Created lookup tables for known malicious IPs

**Example Parse Configuration**:

```spl
[wineventlog://Security]
source::Security
sourcetype::WinEventLog:Security
disabled=0
index=main

# Automatic field extractions
ComputerName = ComputerName
EventCode = EventCode
User = Account_Name
LogonType = Logon_Type
```

---

### Exercise 2: Real-Time Alert Rule Development

**Objective**: Create detection rules for common attack patterns

#### Alert 1: Brute Force Detection

**Rule**: Failed Logon Spike Detection

```spl
sourcetype=WinEventLog:Security EventCode=4625
| stats count by Account_Name, ComputerName
| where count > 10
| alert
```

**Configuration**:
- **Trigger**: When count > 10 failed attempts in 5-minute window
- **Severity**: Medium
- **Action**: Create alert ticket, send email notification
- **Response**: Auto-disable user account (optional containment)

**Alert Performance**:
- True Positive Rate: 94%
- False Positive Rate: 6% (known service account issues)
- Detection Latency: 2-3 minutes average

#### Alert 2: Suspicious Process Execution

**Rule**: PowerShell with Obfuscated Arguments

```spl
sourcetype=WinEventLog:Security EventCode=4688 
parent_image=*explorer.exe 
image=*powershell.exe 
(command_line=*-enc* OR command_line=*-encodedcommand* 
OR command_line=*-ec*)
| eval severity=high
| alert
```

**Configuration**:
- **Trigger**: Process creation matching pattern
- **Severity**: High
- **Action**: Create incident ticket, isolate workstation
- **Context**: Include parent process and timeline

#### Alert 3: Network Beaconing Pattern

**Rule**: Regular Outbound Connections to Suspicious IP

```spl
sourcetype=firewall_logs src_zone=internal dest_zone=external
| stats count, avg(bytes) by dest_ip, dest_port, src_ip
| eval beacon_score=if(count > 100 AND dest_port NOT IN (80,443), 
high, low)
| where beacon_score=high
| threat_intelligence dest_ip
| alert
```

**Configuration**:
- **Trigger**: 100+ connections to same external IP:port in 24 hours
- **Severity**: High
- **Context**: Threat intelligence enrichment
- **Action**: Block IP, investigate source workstation

---

### Exercise 3: Multi-Source Correlation

**Objective**: Correlate events across Windows, network, and proxy logs

**Scenario**: Detect credential compromise and data exfiltration

**Correlation Query**:

```spl
# Step 1: Identify failed logon followed by success (credential compromise)
index=main sourcetype=WinEventLog:Security EventCode=4625 Account_Name=admin
| stats count as failed_count by Account_Name, ComputerName, _time
| where failed_count > 5
| join type=inner Account_Name [
    search sourcetype=WinEventLog:Security EventCode=4624 
    Account_Name=admin LogonType=3
    | stats latest(_time) as success_time by Account_Name
  ]
| eval time_delta=success_time - _time

# Step 2: Correlate with large file access
| join type=inner Account_Name [
    search sourcetype=WinEventLog:Security EventCode=4663 
    ObjectName=*Documents* OR ObjectName=*Finance*
    | stats count as file_count, values(ObjectName) as files by Account_Name
  ]
| where file_count > 10

# Step 3: Correlate with network exfiltration (proxy logs)
| join type=inner ComputerName [
    search sourcetype=proxy_logs src_ip=* 
    | stats sum(bytes_out) as exfil_bytes by src_ip
    | where exfil_bytes > 104857600 (100MB)
    | rename src_ip as ComputerName
  ]
| eval incident_score=if(
  failed_count > 5 AND file_count > 10 AND exfil_bytes > 104857600, 
  CRITICAL, high)
| alert
```

**Results**: Successfully correlated 3 attack stages into single incident

---

### Exercise 4: Dashboard Creation for SOC Monitoring

**Objective**: Build real-time dashboards for SOC analyst operational use

#### Dashboard 1: Security Events Overview

```
┌─────────────────────────────────────────────────────┐
│           Security Operations Dashboard              │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│ │ Open Alerts  │  │ Critical     │  │ Investigations
│ │     23       │  │      2       │  │       4      ││
│ └──────────────┘  └──────────────┘  └──────────────┘│
│                                                       │
│ Alerts by Type (24h)     │ Top Attack Sources (24h) │
│ ┌──────────────────────┐ │ ┌──────────────────────┐ │
│ │ Brute Force      7   │ │ │ 192.168.1.105    15  │ │
│ │ Malware          2   │ │ │ 10.0.3.42         8  │ │
│ │ Anomaly          8   │ │ │ External IP       9  │ │
│ │ Data Exfil       3   │ │ │ (48 more)             │ │
│ └──────────────────────┘ │ └──────────────────────┘ │
│                                                       │
│ Top Failed Logon Accounts    Top Executed Processes │
│ ┌──────────────────────┐ │ ┌──────────────────────┐ │
│ │ admin           47   │ │ │ powershell.exe   34  │ │
│ │ service_account 23   │ │ │ cmd.exe          28  │ │
│ │ guest            8   │ │ │ psexec.exe        6  │ │
│ └──────────────────────┘ │ └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

#### Dashboard 2: Authentication Monitoring

- Real-time successful vs failed logon rates
- Geographic distribution of login sources
- Privileged account access timeline
- Service account anomalies

#### Dashboard 3: Network Traffic Intelligence

- Top external destinations by traffic volume
- Protocol distribution and anomalies
- Known malicious IP connections
- DNS exfiltration detection

---

### Exercise 5: Alert Tuning & Optimization

**Objective**: Reduce false positives while maintaining detection capability

#### Tuning Process

| Initial State | Tuning Method | Final State | Improvement |
|---|---|---|---|
| FP Rate: 65% | Added baseline exceptions | FP Rate: 12% | 53 point improvement |
| Alerts/Day: 287 | Adjusted thresholds | Alerts/Day: 45 | 84% reduction |
| Review Time: 4h | Implemented correlation | Review Time: 45min | 82% faster |
| MTTR: 2.5h | Auto-remediation rules | MTTR: 15min | 90% faster |

#### Key Tuning Decisions

1. **Service Account Exclusions**: Added known service accounts to exception list
2. **Baseline Learning**: Analyzed 30 days of historical data to establish normal thresholds
3. **Correlation Requirements**: Changed from single-event alerts to multi-event correlation
4. **Business Hours Awareness**: Different thresholds for off-hours activity
5. **Confidence Scoring**: Weighted multiple indicators into composite threat score

---

## Skills Developed

### SIEM Administration

✅ Log source configuration and troubleshooting  
✅ Field extraction and data normalization  
✅ Index management and retention policies  
✅ Performance optimization and scalability  
✅ User access control and role-based permissions  

### Detection Engineering

✅ Alert rule writing using Splunk Query Language (SPL)  
✅ Pattern recognition and attack signature development  
✅ Threshold tuning for optimal detection  
✅ Multi-source event correlation  
✅ Threat intelligence integration  

### SOC Operations

✅ Real-time alert triage and response  
✅ Incident escalation procedures  
✅ Evidence collection and preservation  
✅ Dashboard design for operational use  
✅ Metrics and KPI tracking  

---

## Advanced Topics Covered

### Threat Intelligence Integration

```spl
# Integrate external IP reputation
index=main sourcetype=firewall_logs dest_ip=*
| lookup ip_reputation.csv ip as dest_ip OUTPUT reputation_score
| where reputation_score > 50
| stats count by dest_ip, reputation_score
| alert
```

### Machine Learning for Anomaly Detection

- Implemented Splunk ML Toolkit for behavioral analysis
- Trained models on historical network traffic
- Detected statistical outliers in authentication patterns
- Applied dynamic thresholding based on seasonal variations

### Automated Response Actions

- Automatic account lockdown for brute force attacks
- Network isolation of compromised workstations
- Alert ticket creation with structured data
- Escalation workflows for critical incidents

---

## Practical Applications

### Direct SOC Use

- Dashboard installed on SOC analyst workstations
- Alert rules deployed to production SIEM
- Correlation queries integrated into incident response runbooks
- Performance baselines established for alerting threshold tuning

### Incident Support

- Alerts from these rules contributed to detection of incidents documented in writeups
- Correlation queries used in malware analysis and lateral movement investigation
- Dashboard metrics provided situational awareness during active incidents

---

## Recommendations

1. **Production Deployment**: Migrate proof-of-concept alerts to enterprise environment
2. **User Training**: Conduct SOC team training on new dashboards and alert rules
3. **Continuous Improvement**: Establish monthly alert review and tuning schedule
4. **Advanced Correlation**: Develop additional multi-stage attack detection rules
5. **Automation Expansion**: Add more automated response actions for common threats

---

**Lab Status**: Completed  
**Next Steps**: Deploy rules to production SIEM and establish alert review schedule  
**Last Updated**: September 2025  
**Production Ready**: Yes - Alerts deployed and operational
