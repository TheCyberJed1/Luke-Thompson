# OSINT Tool: Log Pattern Analyzer

**Tool Type**: Automation Script for Security Analysis  
**Language**: Python 3.8+ with pandas/numpy  
**Purpose**: Identify suspicious patterns in security logs and generate behavioral indicators  
**Status**: Active / In Use

---

## Tool Overview

This Python tool analyzes large-volume security logs to identify statistical anomalies and behavioral patterns indicative of security incidents. It uses machine learning and statistical analysis to flag unusual activity without requiring manual threshold configuration.

**Use Cases**:
- Analyze Windows Event Logs for behavioral anomalies
- Detect unusual authentication patterns
- Identify data exfiltration indicators in proxy logs
- Correlate events across multiple log sources
- Generate baseline metrics for security monitoring

---

## Ethical Use Disclaimer

**Important**: This tool processes sensitive log data containing user activity.

- Use only on logs within your organization's scope
- Maintain data privacy and confidentiality
- Comply with employee privacy regulations (GDPR, CCPA, etc.)
- Restrict access to authorized security personnel only
- Document justification for deep log analysis
- Protect analyzed data from unauthorized access
- Follow organizational data retention policies

---

## Features

### Pattern Detection Capabilities

1. **Statistical Anomalies**: Deviation from baseline using Z-score analysis
2. **Behavioral Baselines**: Automatic establishment of normal patterns
3. **Time-Series Analysis**: Identification of trends and cyclical patterns
4. **Correlation Detection**: Multi-event sequence identification
5. **Clustering**: Group similar behaviors for pattern discovery
6. **Frequency Analysis**: Histogram-based unusual activity detection

### Supported Log Formats

- Windows Event Log (XML, EVTX)
- Syslog (RFC3164, RFC5424)
- Proxy logs (Squid, Bluecoat, Palo Alto)
- Firewall logs (iptables, Cisco ASA, pfSense)
- Application logs (custom formats with parsing rules)
- CSV/JSON structured logs

### Output Formats

- Interactive HTML report with visualizations
- CSV export for spreadsheet analysis
- JSON for SIEM integration
- Alert generation with severity scoring

---

## Installation

### Requirements

```bash
Python 3.8+
pip install pandas numpy scikit-learn matplotlib seaborn scipy
```

### Configuration

```python
# config.py
LOG_SOURCES = {
    'windows_events': '/var/log/windows/security.evtx',
    'auth_logs': '/var/log/auth.log',
    'proxy_logs': '/var/log/proxy/access.log',
    'firewall_logs': '/var/log/palo_alto/traffic.log'
}

ANALYSIS = {
    'baseline_days': 30,
    'zscore_threshold': 3.0,
    'anomaly_confidence': 0.95,
    'min_events_for_baseline': 100
}

BASELINE_METRICS = {
    'auth_events_per_hour': 150,
    'failed_logins_per_day': 5,
    'outbound_bytes_per_user': 500000000,
    'unique_destinations_per_user': 10
}
```

---

## Usage Examples

### Analyze Authentication Logs for Anomalies

```bash
$ python log_analyzer.py --log auth.log --type authentication --output report.html

╔════════════════════════════════════════════════════════════╗
║         LOG PATTERN ANALYSIS REPORT                        ║
║                                                            ║
║ Log Source: auth.log                                      ║
║ Analysis Period: 2025-08-20 to 2025-09-20 (31 days)      ║
║ Total Events: 47,382                                      ║
╚════════════════════════════════════════════════════════════╝

BASELINE ESTABLISHMENT
├─ Analysis Method: Statistical baseline learning
├─ Reference Period: 2025-08-20 to 2025-09-19 (30 days)
├─ Events in Baseline: 45,821
├─ Baseline Metrics:
│  ├─ Average Events/Hour: 61.5 (±8.2)
│  ├─ Average Failed Logins/Day: 3.2 (±1.8)
│  ├─ Average Unique Users/Day: 147 (±5)
│  └─ Peak Hours: 08:00-18:00 UTC
└─ Baseline Status: ESTABLISHED (sufficient data)

ANOMALY DETECTION RESULTS
├─ Analysis Date: 2025-09-20
├─ Total Anomalies Detected: 12
├─ High Confidence Anomalies: 8
├─ Medium Confidence Anomalies: 3
├─ Low Confidence Anomalies: 1

Anomaly Details:

╔═ ANOMALY #1: Brute Force Authentication ═════════════════╗
║ Type: Statistical Anomaly                                 ║
║ Confidence: 99%                                            ║
║ Time: 2025-09-20 14:24:00 - 14:27:00 UTC                 ║
║ Duration: 3 minutes                                        ║
║ ─────────────────────────────────────────────────────────  ║
║ User: admin                                                ║
║ Source: 192.168.1.105                                     ║
║ Target: DC-01 (Domain Controller)                         ║
║ Failed Attempts: 47                                        ║
║ Baseline Expected: 0.5/hour                               ║
║ Deviation: +9400% from baseline                           ║
║                                                            ║
║ Behavioral Indicators:                                    ║
║ ├─ Regular 15-second intervals between attempts          ║
║ ├─ Consistent payload size (512 bytes)                   ║
║ ├─ No successful authentication                          ║
║ └─ Ceases abruptly (attack termination)                  ║
║                                                            ║
║ Related Incident: SEC-2025-0847                           ║
║ RECOMMENDATION: INVESTIGATE - Likely brute force attack  ║
╚═════════════════════════════════════════════════════════════╝

╔═ ANOMALY #2: Unusual Time-of-Day Activity ════════════════╗
║ Type: Temporal Anomaly                                     ║
║ Confidence: 87%                                            ║
║ Time: 2025-09-20 02:15:00 - 03:45:00 UTC (off-hours)    ║
║ ─────────────────────────────────────────────────────────  ║
║ User: john.doe                                             ║
║ Location: Paris, France (typical: New York, USA)         ║
║ Activity: 23 file accesses, 450 MB download              ║
║ Baseline: 0.1 off-hours events/user/day                  ║
║ Deviation: Unusual time and geography combined           ║
║                                                            ║
║ Pattern Analysis:                                         ║
║ ├─ All accesses to Finance share (unusual for this user) ║
║ ├─ Systematic file enumeration pattern detected          ║
║ ├─ Consistent 5-second intervals between accesses        ║
║ └─ No human typing delays observed                       ║
║                                                            ║
║ RECOMMENDATION: MONITOR - Possible credential compromise ║
║ Suggested Action: Force password reset, review access    ║
╚═════════════════════════════════════════════════════════════╝

╔═ ANOMALY #3: Elevated Data Exfiltration ═══════════════════╗
║ Type: Volume Anomaly                                       ║
║ Confidence: 94%                                            ║
║ Time: 2025-09-20 10:00:00 - 11:30:00 UTC                 ║
║ ─────────────────────────────────────────────────────────  ║
║ Source: EMPLOYEE-DESK-156 (workstation)                  ║
║ Destination: 185.220.101.45 (external)                   ║
║ Data Transferred: 847 MB                                  ║
║ Baseline: 25 MB/hour max                                 ║
║ Deviation: +3288% from baseline                          ║
║                                                            ║
║ Traffic Characteristics:                                  ║
║ ├─ Protocol: HTTPS (port 8443, non-standard)             ║
║ ├─ Packet Pattern: Regular 1-minute intervals            ║
║ ├─ Encryption: Yes (cannot inspect payload)              ║
║ └─ C2-like behavior detected                             ║
║                                                            ║
║ Related Incident: NET-2025-1423                           ║
║ RECOMMENDATION: ISOLATE IMMEDIATELY - Malware beaconing  ║
╚═════════════════════════════════════════════════════════════╝

STATISTICAL SUMMARY

Authentication Activity
├─ Total Logins: 14,285
├─ Successful: 14,238 (99.7%)
├─ Failed: 47 (0.3%) [Anomalous - 15x baseline]
├─ Unique Users: 147
├─ Unique Sources: 89
└─ New Users This Period: 3 (within normal range)

User Activity Clustering
├─ Normal Activity Cluster: 146 users
├─ Anomalous Activity: 1 user (john.doe - unusual geography)
├─ Suspicious Patterns: 2 users (timing anomalies)
└─ Baseline Deviation: 2.1% of user base

Temporal Patterns
├─ Business Hours (08:00-18:00): 72% of activity
├─ Off-Hours (18:00-08:00): 28% of activity [Baseline: 15%]
├─ Weekend Activity: 8% [Baseline: 2%]
└─ Peak Hours: 12:00-13:00 UTC (lunch time browsing)

Geographic Distribution
├─ Primary Location: New York, USA (92%)
├─ Secondary Location: Paris, France (5%) [1 anomalous user]
├─ Other Locations: 3%
└─ New Geographies: 1 (associated with anomaly)
```

### Detect Data Exfiltration Patterns

```bash
$ python log_analyzer.py --log proxy.log --type exfiltration --threshold 500mb

EXFILTRATION ANALYSIS
├─ Analysis Period: 2025-09-10 to 2025-09-20
├─ Total Outbound Transfer: 12.3 TB
├─ Average/User: 84 MB
├─ Anomalies Detected: 5

High-Risk Findings:

User: EMPLOYEE-DESK-156
├─ Total Transfer: 847 MB (10x average)
├─ Destination IPs: 1 (concentrated, unusual)
├─ Destination: 185.220.101.45 (suspicious IP)
├─ Protocol: HTTPS on non-standard port
├─ Timing: Regular 1-minute intervals (automated)
├─ Confidence: 99%
└─ Classification: MALWARE C2 BEACONING

User: sarah.johnson
├─ Total Transfer: 2.1 GB (25x average)
├─ Destination: Multiple cloud storage services
├─ Files: Business documents, presentations
├─ Timing: Normal (scattered throughout day)
├─ Confidence: 62%
└─ Classification: POSSIBLY LEGITIMATE (investigate further)
```

### Generate Correlation Report

```bash
$ python log_analyzer.py --correlate auth.log proxy.log firewall.log --depth advanced

MULTI-SOURCE CORRELATION ANALYSIS

Correlation: Brute Force + Data Exfiltration + Network Anomaly
├─ Timeframe: 2025-09-20 14:00:00 to 15:00:00 UTC
├─ Confidence: 96%
├─ Classification: COORDINATED ATTACK
│
├─ Event 1 (14:24-14:27): Authentication attack
│  └─ 47 failed logins to admin account
│
├─ Event 2 (14:28-14:35): Lateral movement attempt
│  └─ Unusual Kerberos TGT requests (SYSTEM account)
│
├─ Event 3 (14:36-15:00): Data exfiltration
│  └─ 847 MB to external C2 infrastructure
│
└─ ATTACK PATTERN: Credential compromise → Lateral movement → Data theft
   INCIDENT ID: MAL-2025-0921
```

---

## Advanced Features

### Machine Learning-Based Anomaly Detection

The tool implements:
- **Isolation Forest**: Detects statistical outliers
- **DBSCAN Clustering**: Groups similar anomalies
- **K-Means**: Establishes behavioral clusters
- **Autoencoder**: Neural network anomaly detection

### Customizable Analysis Rules

```python
# Example custom rule
RULES = {
    'brute_force': {
        'metric': 'failed_login_count',
        'threshold': 10,
        'window': '5min',
        'severity': 'high'
    },
    'data_exfil': {
        'metric': 'outbound_bytes',
        'threshold': 500000000,  # 500 MB
        'window': '1hour',
        'severity': 'critical'
    }
}
```

---

## Performance

- **Processing Speed**: 100,000 events/second
- **Memory Usage**: Efficient streaming for large logs
- **Report Generation**: < 30 seconds for daily analysis
- **Scalability**: Handles logs > 10 GB using partitioning

---

## Integration with Incident Response

### Real-World Application

**Incident MAL-2025-0921**:
- Tool detected 99% confidence malware beaconing
- Identified exfiltration pattern in historical logs
- Provided timeline for forensic analysis
- Enabled rapid incident classification

---

## Limitations & Best Practices

### Limitations

- Requires 30 days baseline data for accurate analysis
- Cannot analyze encrypted traffic payloads
- May have false positives in highly variable environments
- Baseline must be re-established if environment changes significantly

### Best Practices

1. **Establish Baseline**: Ensure 30+ days of clean data before analysis
2. **Regular Reviews**: Update baselines monthly
3. **Cross-Reference**: Validate findings with other detection methods
4. **Document Exceptions**: Track known-good anomalies to reduce noise
5. **Secure Logs**: Protect analyzed logs with appropriate access controls

---

**Last Updated**: September 2025  
**Version**: 1.5  
**Status**: Production - In Active Use  
**Performance**: Processing 2+ GB logs daily for security monitoring
