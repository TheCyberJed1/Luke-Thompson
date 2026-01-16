# Lab: TryHackMe Cyber Defense Pathway

**Completion Date**: August 2025  
**Platform**: TryHackMe  
**Status**: In Progress (50+ rooms completed)

---

## Lab Overview

The TryHackMe Cyber Defense Pathway is a comprehensive training program designed to teach defensive security operations, SOC procedures, and incident response methodologies through hands-on exercises.

**Pathway Focus**: Blue Team / SOC Operations

---

## Objectives Completed

### Core SOC Skills

- ✅ **SOC Level 1**: Introduction to Security Operations Center roles and responsibilities
- ✅ **Incident Handling**: Structured incident response process (NIST framework)
- ✅ **Windows Event Logs**: Parsing and analysis of security events
- ✅ **Sigma Rules**: Writing detection rules for security event correlation
- ✅ **VirusTotal**: File and URL analysis using automated threat intelligence
- ✅ **YARA**: Creating malware detection rules
- ✅ **Splunk Basics**: Log aggregation, searching, and dashboard creation

### Threat Intelligence

- ✅ **OSINT (Open Source Intelligence)**: Data gathering from public sources
- ✅ **Threat Intelligence**: Understanding adversary tactics and IOCs
- ✅ **MITRE ATT&CK**: Mapping malware behavior to techniques and tactics
- ✅ **Malware Analysis**: Static and behavioral analysis fundamentals

### Linux & Windows

- ✅ **Linux Fundamentals**: Command-line operations and scripting
- ✅ **Windows Fundamentals**: User management, registry, event logs
- ✅ **Bash Scripting**: Automation and log parsing scripts

---

## Key Findings & Skills Demonstrated

### Log Analysis Proficiency

Developed ability to:
- Parse Windows Security Event Log (Event ID analysis)
- Identify suspicious authentication patterns
- Correlate events across multiple logs
- Reconstruct attack timelines
- Distinguish true positives from false positives

**Example**: Successfully identified brute force attack by analyzing Event ID 4625 (Failed Login) with 40+ occurrences in 5-minute window, confirming account lockout activity.

### SIEM & Dashboard Creation

- Created custom Splunk dashboards for real-time monitoring
- Configured alerting rules based on threshold values
- Built data ingestion pipelines for multiple log sources
- Developed KPIs for security metrics tracking

### Incident Response Workflow

Applied structured methodology:
1. **Detection**: Identify abnormal security events
2. **Analysis**: Gather and correlate evidence
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat from environment
5. **Recovery**: Restore systems to normal state
6. **Post-Incident**: Document findings and improve processes

---

## Challenges & Problem-Solving

### Challenge: Identifying Obfuscated Malware

**Scenario**: Analyze suspicious PowerShell execution with encoded command-line arguments.

**Solution**:
- Decoded base64-encoded payload
- Identified malicious MITRE ATT&CK techniques
- Traced execution chain and process injection
- Correlated with threat intelligence (VirusTotal results)

**Outcome**: Successfully classified as advanced threat (APT) and recommended containment strategy.

### Challenge: SIEM Rule Tuning

**Scenario**: False positive rate of 95% in brute-force detection rule - overwhelming alert volume.

**Solution**:
- Analyzed baseline network behavior
- Adjusted threshold from 5 failed attempts to 10 failed attempts
- Added time-window sensitivity (only during business hours)
- Excluded known service accounts from alerting

**Outcome**: Reduced false positives by 90% while maintaining detection of actual threats.

---

## Practical Applications

### Real-World Translation

These training exercises directly apply to SOC Analyst Level 1 responsibilities:

| Lab Skill | SOC Application | Relevance |
|---|---|---|
| Windows Event Log Analysis | Daily log review and triage | Critical |
| Sigma Rule Writing | Alert creation and tuning | Essential |
| YARA Rules | Malware detection and hunting | High |
| Incident Response Workflow | Actual incident handling | Critical |
| Threat Intelligence Integration | Investigation enrichment | Essential |

### Incident Writeups Created

Training labs directly supported documented incidents:
- **Brute Force Detection**: Applied Windows event log analysis skills to real Alert ID SEC-2025-0847
- **Network Beaconing**: Used OSINT enrichment and MITRE mapping from training exercises
- **Malware Analysis**: Implemented YARA/VirusTotal analysis workflow on Alert ID MAL-2025-0921

---

## Tools & Technologies Used

- **Splunk**: Log aggregation and analysis
- **VirusTotal**: Malware and URL analysis
- **YARA**: Malware detection rules
- **Sigma**: Generic detection rules
- **MITRE ATT&CK Navigator**: Adversary technique mapping
- **Wireshark**: Network packet analysis (complementary)
- **Windows Event Viewer**: Native log analysis
- **PowerShell**: Log parsing and automation

---

## Learning Outcomes

### Competencies Developed

✅ **Alert Triage**: Rapidly assess security alerts and determine severity  
✅ **Evidence Analysis**: Collect and correlate evidence from multiple sources  
✅ **False Positive Analysis**: Distinguish legitimate activity from threats  
✅ **Timeline Construction**: Reconstruct event sequences chronologically  
✅ **Threat Intelligence Integration**: Enrich investigations with external data  
✅ **Documentation**: Write clear, professional incident reports  
✅ **SOC Workflow**: Execute proper incident response procedures  

### Knowledge Reinforcement

- NIST Incident Response framework
- Cyber Kill Chain (Lockheed Martin)
- MITRE ATT&CK tactics and techniques
- Windows security architecture
- Network communication patterns
- Malware delivery and execution methods

---

## Recommendations for Continued Learning

1. **Advanced Malware Analysis**: Complete malware analysis sandbox training (unpacking, behavioral analysis)
2. **Threat Hunting**: Develop proactive threat hunting techniques and queries
3. **Network Forensics**: Deepen network analysis skills (Zeek, Suricata)
4. **Cloud Security**: Extend skills to cloud-native SOC operations (AWS, Azure)
5. **Purple Team Exercises**: Participate in adversary simulation and red team testing

---

**Last Updated**: August 2025  
**Next Checkpoint**: September 2025 - Complete advanced malware analysis module
