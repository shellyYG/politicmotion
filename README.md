# Politicmotion
#### An interactive news-search website that enables users to search news, compare reader emotions, and chat with people who cared about the similar topics
####  > Website Link: https://politicmotion.club
####  > Demo Account: dummy@e / Password: dummy


## Table of Content
- [Technologies](#Technologies)
- [Architecture](#Architecture)
- [Database Schema](#Database-Schema)
- [Main Features](#Main-Features)
- [Author](#Author)

## Technologies
### Back-End
- Node.js / Express.js
- RESTful API
- Linux
- NGINX
- Socket.IO
- Python Web Crawler
- crontab

### Front-End
- HTML
- CSS
- JavaScript
- Bootstrap
- Axios

### Cloud Service (AWS)
- Elastic Compute Cloud (EC2)
- Relational Database Service (RDS)
- CloudFront

### Database
- MySQL

### Networking
- HTTP
- HTTPS / SSL
- Domain Name System

### Test
- Mocha
- Chai

### Others
- Google Natural Language API
- Design Pattern: MVC
- Version Control: Git, GitHub
- Agile: Trello (Srum)


## Architecture
![](https://github.com/shellyYG/public_assets/blob/main/Infrastructure.png)

## Database Schema

## Main Features
### User Authentication & Authorization
- Register as new user
- Login as existing user
![](https://github.com/shellyYG/public_assets/blob/main/login.gif)

### News Search & Select
- Search latest political news
- Select news according to natural language processing scores
- Receive recommended news according to TF-IDF & cosine similarity
![](https://github.com/shellyYG/public_assets/blob/main/SearchAndSelect.gif)

### News Display / User Emotion Analysis
- Read both selected & recommended news
- Receive user emotion score and compare with general FB audience
![](https://github.com/shellyYG/public_assets/blob/main/clickEmotion.gif)

### Chat Room / Chat Partner Recommendation
- Arrive chat room to meet people who care about the same topics
- Receive top-recommended chat partner who has the most similar emotion score as the user
- Change room to find friends with different interests
![](https://github.com/shellyYG/public_assets/blob/main/findChatpartner.gif)

## Author
Name: Shelly Yang @[shellyYG](https://github.com/shellyYG)