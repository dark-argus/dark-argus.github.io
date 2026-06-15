---
categories: [Active Directory]
Difficulty: Easy
Platform: HackSmarterLabs
status: Completed
tags:
  - password-reuse
  - kerberoasting
  - smb
  - AD
---
![Pasted image 20260515110930](/assets/img/posts/MartiniAD/Pasted image 20260515110930.png)

{: .prompt-info }
>An adult beverage company "Martini Bars" recently had a corporate breach and the compliance and risk team dictates they perform a penetration test at one of their branch offices. The Hack Smarter team has been authorized to perform an internal black box pentest.

# Information Gathering
## Retrieving the `Hostname` and Domain Name
```bash
[May 15, 2026 - 11:20:56 (IST)] exegol-neuron MartiniAD # nxc smb 10.1.44.236
SMB         10.1.44.236     445    DC01             [*] Windows 11 / Server 2025 Build 26100 x64 (name:DC01) (domain:DRY.MARTINI.BARS) (signing:False) (SMBv1:None)
```
- Hostname - `DC01`
- Domain - `DRY.MARTINI.BARS`
## Network Scan


## SMB Enumeration
Lets start with checking if null auth is allowed
```bash
nxc smb "$DOMAIN" -u '' -p ''
```
![Pasted image 20260515115623](/assets/img/posts/MartiniAD/Pasted image 20260515115623.png)
Yes, null auth is allowed on the domain
Now let's see if we can check the shares that the machine exposes and if we are allowed to use them.
```bash
nxc smb "$DOMAIN" -u '' -p '' --shares
```
![Pasted image 20260515115746](/assets/img/posts/MartiniAD/Pasted image 20260515115746.png)
We cannot access any share with null auth, now let's check if the Guest account is enabled or not and if it is enabled what shares we can access with it.
```bash
nxc smb "$DOMAIN" -u 'Guest' -p '' --shares
```
![Pasted image 20260515115953](/assets/img/posts/MartiniAD/Pasted image 20260515115953.png)
Guest account is enabled and we have access R&W permissions on a share called `Notes`. Let's see what is inside
![Pasted image 20260515121340](/assets/img/posts/MartiniAD/Pasted image 20260515121340.png)
Inside the share, we have a file called `notes.txt`, we have downloaded it, now let's see what it says.
![Pasted image 20260515121949](/assets/img/posts/MartiniAD/Pasted image 20260515121949.png)
We have credentials, Now let's use them for a bloodhound dump
I am more comfortable with using `rusthound-ce` so i will be using that, you can use any tool of your choice for the dump.

## Bloodhound
### BloodHound Collection — LDAP Signing Enforcement

#### The Problem
Initial RustHound collection with plaintext credentials over LDAP (port 389) failed immediately:
> `LDAP operation result: rc=8 (strongerAuthRequired)`
![Pasted image 20260515125406](/assets/img/posts/MartiniAD/Pasted image 20260515125406.png)

The DC had **LDAP signing enforced**, meaning it rejects simple password-based binds unless the connection is protected by TLS or Kerberos integrity checking. Port 636 (LDAPS) appeared open in the nmap scan but returned `tcpwrapped` — the DC had no properly configured TLS certificate, so every LDAPS connection was reset before the handshake completed.
![Pasted image 20260515125458](/assets/img/posts/MartiniAD/Pasted image 20260515125458.png)
#### The Fix
The solution is to authenticate via **`Kerberos`** rather than a password bind, which satisfies the signing requirement without needing `TLS`.

**Step 1 — Get a `TGT`:**
```bash
getTGT.py -dc-ip "$DC_HOST" "$DOMAIN"/"$USER":"$PASSWORD"
export KRB5CCNAME=/path/to/mprice.ccache
```
![Pasted image 20260515125614](/assets/img/posts/MartiniAD/Pasted image 20260515125614.png)

**Step 2 — Run `RustHound` with `-k` flag:**
```bash
rusthound-ce -d "$DOMAIN" -k -c All -f DC01.DRY.MARTINI.BARS -i $DC_IP --dns-tcp
```
![Pasted image 20260515125714](/assets/img/posts/MartiniAD/Pasted image 20260515125714.png)
#### Why This Works
`Kerberos` uses mutual authentication with integrity checking built into the protocol itself. The DC's signing requirement is satisfied because `Kerberos` `SASL` binds are inherently signed — no `TLS` needed. `RustHound` correctly passes the `ccache` through for the `LDAP` bind, unlike `nxc's BloodHound` module which drops back to password auth.
#### Key Takeaway

If you hit `strongerAuthRequired` (rc=8) and LDAPS is unavailable or broken: **get a TGT first and use `-k`**. Don't waste time debugging certificates.

### Investigating with bloodhound
![Pasted image 20260515130453](/assets/img/posts/MartiniAD/Pasted image 20260515130453.png)
Our current user has no special privileges, let's see if we have other account's we can access with other techniques
![Pasted image 20260515130559](/assets/img/posts/MartiniAD/Pasted image 20260515130559.png)
No `ASREPRoastable` users but a `kerberoastable` user, looks interesting.
# Exploitation

## Kerberoasting

>**Kerberoasting** is a technique where adversaries request encrypted Kerberos service tickets (TGS) for accounts with Service Principal Names (SPNs) and crack the password hashes offline to recover plaintext credentials.  Classified under **MITRE ATT&CK ID T1558.003**, this method allows any authenticated domain user to harvest service account passwords without triggering immediate alerts, as the initial ticket requests are legitimate Kerberos operations.

To do this we can use `NetExec` or `GetUserSPNs.py` ( A part of the impacket toolkit).
### Using `GetUserSPNs.py`
```bash
 GetUserSPNs.py -outputfile Kerberoastables.txt -dc-ip "$DC_IP" "$DOMAIN"/"$USER":"$PASSWORD"
```
![Pasted image 20260515131427](/assets/img/posts/MartiniAD/Pasted image 20260515131427.png)

### Using netexec
```bash
nxc ldap "$DOMAIN" -u "$USER" -p "$PASSWORD" --kerberoasting Kerberoastable.txt
```
![Pasted image 20260515131547](/assets/img/posts/MartiniAD/Pasted image 20260515131547.png)

## Cracking the TGS with hashcat
To find the mode we can either do a simple google search or ask an AI, or you can do matching
![Pasted image 20260515131754](/assets/img/posts/MartiniAD/Pasted image 20260515131754.png)

Cracked!!!!![Pasted image 20260515131837](/assets/img/posts/MartiniAD/Pasted image 20260515131837.png)

# Post Exploitation
Now lets check what privileges does the user whose password we cracked have
![Pasted image 20260515132034](/assets/img/posts/MartiniAD/Pasted image 20260515132034.png)
We can use this user over RDP or WINRM as he is a member of both `Remote Desktop Users` and `Remote Management Users`.
Lets login via WinRM and try to elevate ourselves.

## EvilwinRM
I tried a lot of things and found nothing, then i thought about password spraying the two credentials and see if we find anything.

## Password Spray
Before we do a password spray we need a list of users that exist.
To get those users we will be using NetExec

### Getting all the users
To get the users we will use the nxc with ldap protocol and use the flag `--users-export` to save the users to a file
```bash
nxc ldap "$DOMAIN" -u "$USER" -p "$PASSWORD" --users-export users.txt
```
![Pasted image 20260515145532](/assets/img/posts/MartiniAD/Pasted image 20260515145532.png)
Now let's spray the passwords

### Password Spray
Make a file called passwords and store the 2 passwords we have inside it then do the spray
```bash
nxc ldap "$DOMAIN" -u users.txt -p passwords --continue-on-success
```
![Pasted image 20260515145911](/assets/img/posts/MartiniAD/Pasted image 20260515145911.png)
We got access to another user called `athena.t0`, most likely a Tier 0 Admin, let's check in Bloodhound
![Pasted image 20260515150125](/assets/img/posts/MartiniAD/Pasted image 20260515150125.png)
He is a domain admin.
Now do a DCSync attack and get the KRBTGT hash and submit it to finish the machine
```bash
nxc smb "$DOMAIN" -u "$USER" -p "$PASSWORD" --ntds --user krbtgt
```
![Pasted image 20260515150917](/assets/img/posts/MartiniAD/Pasted image 20260515150917.png)
![Pasted image 20260515150944](/assets/img/posts/MartiniAD/Pasted image 20260515150944.png)
PWNED!!!!!!!
