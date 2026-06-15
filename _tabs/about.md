---
icon: fas fa-info-circle
order: 4
---

## whoami

{% assign bday_month = 8 %}{% assign bday_year = 2007 %}{% assign current_year = 'now' | date: '%Y' | plus: 0 %}{% assign current_month = 'now' | date: '%-m' | plus: 0 %}{% if current_month >= bday_month %}{% assign age = current_year | minus: bday_year %}{% else %}{% assign age = current_year | minus: bday_year | minus: 1 %}{% endif %}

The name's Mohammad Sheeban — {{ age }}, pre-college, and apparently
too busy breaking into machines to get a degree.

I'm an offensive security researcher based in India. Web
exploitation, Active Directory attack chains, vulnerability
research, CTF — the whole offensive playbook. Self-taught,
which is a polite way of saying I learned most of this by
doing things I probably shouldn't have, on systems I probably
shouldn't have touched, at ages I definitely shouldn't have
been doing any of this.

I've since corrected my moral compass. Mostly.

These days I break things with permission, document everything
obsessively, and run a home lab that my electricity bill deeply
resents. No degree. No certification gatekeeping. Just six years
of obsession, a lot of broken machines, and the stubborn belief
that if you understand something deeply enough — you can break
anything.

---

## how it started

I was nine years old when I watched Elliot Alderson sit alone
in a dark room and quietly dismantle the financial system of
the world. No guns. No explosions. Just a keyboard, a hoodie,
and the knowledge of how things actually work under the surface.

That was it for me.

I didn't understand half of what he was doing — but I understood
the power. The idea that knowledge of systems gives you leverage
over systems. That's never left me.

I started where every kid starts — Lucky Patcher, cracked Subway
Surfers, free coins in whatever mobile game was popular that week.
Technically hacking. Ethically questionable. Completely formative.

For a few years after that it was scattered — small experiments,
curiosity without direction, learning the vocabulary of something
I didn't yet fully understand. The kind of phase everyone goes
through but nobody writes about.

Mid-2020 is when things got serious. Real labs. Real techniques.
Real consequences if I got it wrong. Six years of that,
compounding.

---

## why Argus?

In Greek mythology, Argus Panoptes was a giant covered in a
hundred eyes. He never fully slept — while some eyes rested,
others stayed open. Always watching. Always aware.
Nothing escaped him.

That's enumeration. That's the philosophy behind everything
I do in security.

Before you exploit anything, you see everything. You map the
surface. You find what others miss. Most people rush to the
attack — the ones who win are the ones who looked harder
during recon.

A hundred eyes on every system.

---

## what i do

**Offensive Security**
Web exploitation, Active Directory attack chains, network
pentesting, vulnerability research on personal hardware.
I write mock pentest reports following real methodology —
not just "I found RCE", but why it exists and how to fix it.

**CTF & Labs**
HackTheBox and TryHackMe — currently gravitating toward
Hard/Insane boxes and full AD environments. Running GOAD
(Game of Active Directory) and multiple other vulnerable
AD Environment on Proxmox at home for realistic attack
practice.

**Tools I actually use**
`Burp Suite` `Nmap` `BloodHound` `Netexec` `Impacket`
`Ffuf` `Hydra` `Exegol` `Python` `BloodyAD` `Sliver-C2` 
`Mythic-C2` `Metasploit`

**Currently learning**
- PortSwigger Web Academy — SQL Injection, following completion
of Path Traversal and File Inclusion.
---

## find me

- GitHub → [dark-argus](https://github.com/dark-argus)
- LinkedIn → [Mohammad Sheeban](https://www.linkedin.com/in/mohammad-sheeban8a4857416)
- Email → argus-security919@proton.me
- Instagram → [@0xdark_argus](https://instagram.com/0xdark_argus)

---

*If you made it this far — thanks for reading. The best way
to know me is to read what I build and break. Everything here
is documented honestly and in detail.*

*— Mohammad Sheeban*

**See everything. Miss nothing.**