# OSINT Tool: IP Reputation Enrichment Script

**Tool Type**: OSINT Automation Script  
**Language**: Python 3.8+  
**Purpose**: Automated IP reputation gathering and threat intelligence enrichment  
**Status**: Active / In Use

---

## Script Code

```python
#!/usr/bin/env python3
"""
IP Reputation Enrichment
- AbuseIPDB
- VirusTotal
- AlienVault OTX
- Shodan
- GeoIP (ipinfo)

Usage:
  python ip_reputation_enrich.py --ip 8.8.8.8
  python ip_reputation_enrich.py --ip 8.8.8.8 --ip 1.1.1.1 --out results.json
  python ip_reputation_enrich.py --file ips.txt --out results.json
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

import requests

# ---------------------------
# Configuration / Endpoints
# ---------------------------
ABUSEIPDB_URL = "https://api.abuseipdb.com/api/v2/check"
VT_URL = "https://www.virustotal.com/api/v3/ip_addresses/{ip}"
OTX_URL = "https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general"
SHODAN_URL = "https://api.shodan.io/shodan/host/{ip}"
IPINFO_URL = "https://ipinfo.io/{ip}/json"

USER_AGENT = "ip-reputation-enrich/1.0"

# ---------------------------
# Helpers
# ---------------------------
def read_ips_from_file(path: str) -> List[str]:
    ips = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                ips.append(line)
    return ips

def http_get(url: str, headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    headers = headers or {}
    headers["User-Agent"] = USER_AGENT
    resp = requests.get(url, headers=headers, params=params, timeout=30)
    if resp.status_code >= 400:
        return {"error": f"HTTP {resp.status_code}", "response": resp.text}
    try:
        return resp.json()
    except Exception:
        return {"error": "non-json-response", "response": resp.text}

def safe_get(d: Dict[str, Any], *keys, default=None):
    cur = d
    for k in keys:
        if isinstance(cur, dict) and k in cur:
            cur = cur[k]
        else:
            return default
    return cur

# ---------------------------
# Providers
# ---------------------------
def abuseipdb_lookup(ip: str, api_key: str) -> Dict[str, Any]:
    if not api_key:
        return {"error": "missing_api_key"}
    headers = {"Key": api_key, "Accept": "application/json"}
    params = {"ipAddress": ip, "maxAgeInDays": 90, "verbose": "true"}
    return http_get(ABUSEIPDB_URL, headers=headers, params=params)

def virustotal_lookup(ip: str, api_key: str) -> Dict[str, Any]:
    if not api_key:
        return {"error": "missing_api_key"}
    headers = {"x-apikey": api_key}
    return http_get(VT_URL.format(ip=ip), headers=headers)

def otx_lookup(ip: str, api_key: str) -> Dict[str, Any]:
    # OTX API key optional for higher rate limits; still works without for many endpoints.
    headers = {"X-OTX-API-KEY": api_key} if api_key else {}
    return http_get(OTX_URL.format(ip=ip), headers=headers)

def shodan_lookup(ip: str, api_key: str) -> Dict[str, Any]:
    if not api_key:
        return {"error": "missing_api_key"}
    params = {"key": api_key}
    return http_get(SHODAN_URL.format(ip=ip), params=params)

def ipinfo_lookup(ip: str, token: str) -> Dict[str, Any]:
    # Token optional for limited usage.
    params = {"token": token} if token else None
    return http_get(IPINFO_URL.format(ip=ip), params=params)

# ---------------------------
# Normalization / Summary
# ---------------------------
def summarize(ip: str, data: Dict[str, Any]) -> Dict[str, Any]:
    abuse = data.get("abuseipdb", {})
    vt = data.get("virustotal", {})
    otx = data.get("otx", {})
    shodan = data.get("shodan", {})
    geo = data.get("geoip", {})

    abuse_score = safe_get(abuse, "data", "abuseConfidenceScore")
    abuse_reports = safe_get(abuse, "data", "totalReports")

    vt_stats = safe_get(vt, "data", "attributes", "last_analysis_stats", default={})
    vt_mal = vt_stats.get("malicious")
    vt_susp = vt_stats.get("suspicious")

    otx_pulses = safe_get(otx, "pulse_info", "count")
    shodan_ports = safe_get(shodan, "ports", default=[])
    geo_country = geo.get("country")
    geo_city = geo.get("city")
    org = geo.get("org") or safe_get(abuse, "data", "isp")

    return {
        "ip": ip,
        "abuseipdb_score": abuse_score,
        "abuseipdb_reports": abuse_reports,
        "virustotal_malicious": vt_mal,
        "virustotal_suspicious": vt_susp,
        "otx_pulse_count": otx_pulses,
        "shodan_ports": shodan_ports,
        "geo_country": geo_country,
        "geo_city": geo_city,
        "org": org,
    }

# ---------------------------
# Main
# ---------------------------
def main():
    parser = argparse.ArgumentParser(description="IP Reputation Enrichment")
    parser.add_argument("--ip", action="append", help="IP address to enrich (can be used multiple times)")
    parser.add_argument("--file", help="File with one IP per line")
    parser.add_argument("--out", help="Output JSON file")
    parser.add_argument("--sleep", type=float, default=0.0, help="Sleep between IPs to respect rate limits")
    args = parser.parse_args()

    ips = []
    if args.ip:
        ips.extend(args.ip)
    if args.file:
        ips.extend(read_ips_from_file(args.file))

    if not ips:
        print("No IPs provided. Use --ip or --file.", file=sys.stderr)
        sys.exit(1)

    abuse_key = os.getenv("ABUSEIPDB_API_KEY", "")
    vt_key = os.getenv("VT_API_KEY", "")
    otx_key = os.getenv("OTX_API_KEY", "")
    shodan_key = os.getenv("SHODAN_API_KEY", "")
    ipinfo_token = os.getenv("IPINFO_TOKEN", "")

    results = []
    for ip in ips:
        entry = {
            "ip": ip,
            "timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "abuseipdb": abuseipdb_lookup(ip, abuse_key),
            "virustotal": virustotal_lookup(ip, vt_key),
            "otx": otx_lookup(ip, otx_key),
            "shodan": shodan_lookup(ip, shodan_key),
            "geoip": ipinfo_lookup(ip, ipinfo_token),
        }
        entry["summary"] = summarize(ip, entry)
        results.append(entry)

        if args.sleep:
            time.sleep(args.sleep)

    output = {"count": len(results), "results": results}

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)
        print(f"Wrote {args.out}")
    else:
        print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
```

---

## Tool Overview

This Python script automates the process of gathering threat intelligence on IP addresses using multiple free and commercial APIs. It enriches security investigations with reputation data, geographic location, ASN information, and known malware associations.

**Use Cases**:
- Investigate suspicious external IPs in network alerts
- Enrich source IPs from incident logs
- Bulk scanning of suspicious IP ranges
- Integration with SIEM for automated enrichment

---

## Ethical Use Disclaimer

**Important**: This tool is designed for authorized security investigations and legitimate security operations only. 

- Use only on IP addresses related to your organization's security incidents
- Comply with all applicable laws and regulations
- Respect API rate limits and terms of service
- Do not use for unauthorized scanning or intelligence gathering
- Coordinate with legal and compliance teams before investigation
- Report findings through proper incident response channels

---

## Features

### Data Sources Integrated

1. **AbuseIPDB**: IP reputation and reported abuse history
2. **VirusTotal**: Malware and URL analysis
3. **AlienVault OTX**: Open threat intelligence feeds
4. **Shodan**: Internet-connected device and port scanning
5. **IPInfo**: Geographic location and ASN information

### Output Capabilities

- **Console Output**: JSON formatted output for quick review
- **JSON Export**: Machine-readable format for integration
- **Bulk Processing**: Process multiple IPs from command line or file
- **Rate Limiting**: Built-in sleep option to respect API limits

---

## Installation & Setup

### Requirements

```bash
Python 3.8+
pip install requests
```

### Configuration

Set environment variables for API keys:

```bash
export ABUSEIPDB_API_KEY="your_key_here"
export VT_API_KEY="your_key_here"
export OTX_API_KEY="your_key_here"
export SHODAN_API_KEY="your_key_here"
export IPINFO_TOKEN="your_token_here"
```

---

## Usage Examples

### Single IP Investigation

```bash
$ python ip_reputation_enrich.py --ip 8.8.8.8
```

Output example:
```json
{
  "count": 1,
  "results": [
    {
      "ip": "8.8.8.8",
      "timestamp_utc": "2025-09-22T14:32:15.123456Z",
      "abuseipdb": {
        "data": {
          "abuseConfidenceScore": 0,
          "totalReports": 0,
          "isp": "Google LLC"
        }
      },
      "virustotal": {
        "data": {
          "attributes": {
            "last_analysis_stats": {
              "malicious": 0,
              "suspicious": 0
            }
          }
        }
      },
      "otx": {
        "pulse_info": {
          "count": 2
        }
      },
      "shodan": {
        "ports": [53, 443]
      },
      "geoip": {
        "city": "Mountain View",
        "country": "US",
        "org": "AS15169 Google LLC"
      },
      "summary": {
        "ip": "8.8.8.8",
        "abuseipdb_score": 0,
        "abuseipdb_reports": 0,
        "virustotal_malicious": 0,
        "virustotal_suspicious": 0,
        "otx_pulse_count": 2,
        "shodan_ports": [53, 443],
        "geo_country": "US",
        "geo_city": "Mountain View",
        "org": "AS15169 Google LLC"
      }
    }
  ]
}
```

### Multiple IPs

```bash
$ python ip_reputation_enrich.py --ip 8.8.8.8 --ip 1.1.1.1 --out results.json
Wrote results.json
```

### Bulk IP Processing from File

```bash
$ python ip_reputation_enrich.py --file ips.txt --out results.json --sleep 1.0
Wrote results.json
```

Example `ips.txt` file:
```
8.8.8.8
1.1.1.1
# This is a comment
185.220.101.45
```

---

## Integration with Incident Investigation

### Real-World Application

**Incident: NET-2025-1423 (Network Beaconing)**

```
1. Alert detects beaconing to 185.220.101.45
2. Analyst runs: python ip_reputation_enrich.py --ip 185.220.101.45
3. Tool confirms:
   - High AbuseIPDB reputation score
   - Multiple threat intelligence sources flag the IP
   - Known malicious activity and open ports
4. High-confidence classification: TRUE POSITIVE
5. Immediate action: Block IP, isolate workstation
```

**Time Saved**: 15+ minutes of manual research condensed to < 1 minute

### Output Integration

- Results can be parsed and integrated into incident tickets
- JSON output can be fed into SIEM platforms
- Summary data provides quick decision-making information
- Automated enrichment in SOC workflows

---

## API Rate Limits & Costs

| Service | Free Tier | Rate Limit | Cost for Higher Limits |
|---|---|---|---|
| AbuseIPDB | 1,000 queries/day | 1 query/sec | $99/month |
| VirusTotal | 4 requests/min | Standard | API Key required |
| AlienVault OTX | Unlimited | Unlimited | Free |
| Shodan | 1 query/month | Limited | $59/month |
| IPInfo | 50,000/month | Varies | Free tier available |

---

## Limitations & Considerations

### Limitations

- **API Keys Required**: Most services require API keys for full functionality
- **API Delays**: Some services may have 24-48 hour data lag
- **Rate Limits**: Free tiers may not support high-volume scanning
- **Accuracy Variance**: Different services may provide conflicting information

### Best Practices

1. Use environment variables for API keys (never hardcode)
2. Cross-reference multiple sources for critical decisions
3. Respect API terms of service and rate limits
4. Use the `--sleep` parameter for bulk operations
5. Cache results to avoid duplicate queries
6. Maintain audit logs of all enrichment queries

---

## Script Features

- **Multi-Provider Support**: Queries 5 different threat intelligence sources
- **Flexible Input**: Single IP, multiple IPs, or file-based input
- **Rate Limiting**: Built-in sleep option between requests
- **Summary Generation**: Automated summarization of key findings
- **JSON Output**: Structured data for integration and automation
- **Error Handling**: Graceful handling of API errors and missing keys

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: Production - Ready for Use  
**Maintenance**: API endpoints are current as of January 2026
