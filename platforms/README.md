# DevSoc Subcommittee Recruitment: Platforms
Your task is to send a direct message to the matrix handle `@chino:oxn.sh` using the Matrix protocol. However, this message must be sent over a self hosted instance such as through the Conduwuit implementation or the slightly more complicated Synapse implementation.

For this to work your server must be federated, but you do not have to worry about specifics such as using your domain name as your handle (a subdomain will do!) or have other 'nice to have' features. Just a message will do!

**You should write about what you tried and your process in the answer box below.**

If you don't manage to get this working we'll still want to hear about what you tried, what worked and what didn't work, etc. Good luck!

---

# ANSWER SECTION

### Initial Planning

1. Important Words (Objectives)
    - Words I know: Matrix (Heard about it in a random Youtube video saying it was pretty dangerous because of its decentralised nature)
    - Words idk: Synapse, Conduwuit, federated
2. Learn how to host a Synapse server with Python
3. Make a Synapse server, make it federated (publicly reachable?)
4. Send a message

### A brief log

0. I know the basics about Matrix that it's decentralised (and can be used with unlawful purposes)
1. Just to reinforce my learning, learnt the technical foundations of Matrix from docs & Youtube
2. Tried to learn Synapse after hearing Conduwuit is Rust-based (Haven't done Rust before)
3. Realised I don't need to know Rust to run Conduwuit
4. Started learning Conduwuit, reading the official README on Conduwuit's Github & official site
5. Changed stuff within my local `.toml` file
6. Set up a conduwuit server locally with a self-signed cert
7. Realised self-signed certs will logically not work
8. Frankly I ran out of time because I have other priorities to do 😭
