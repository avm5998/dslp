# Data Science Learning Platform Deployment & Database Instruction

# Deployment on server

---

1. Log in server
    
    **vclient5 (Testing server)**
    
    ```bash
    $ ssh [vclient5.cs.rit.edu](http://vclient5.cs.rit.edu) -l username
    
    $ enter_your_pwd
    ```
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled.png)
    
    **vclient4 (Production server)**
    
    ```bash
    ~$ ssh [vclient5.cs.rit.edu](http://vclient5.cs.rit.edu) -l username
    
    ~$ enter_your_pwd
    ```
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled%201.png)
    
2. Go to project folder
    
    ```bash
    ~$ cd /home/lz3519/data_mining_main/awesome-data-mining/
    ```
    
3. Pull code from reporsitory
    
    ```bash
    git pull
    ```
    
4. Complie code for forntend
    
    ```bash
    npm run build
    ```
    
5. Restart backend and forntend
    
    ```bash
    pm2 restart all
    ```
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled%202.png)
    

# Query From MongoDB

---

After log in to the server. Here use vclient4 as an example.

1. Access Databse
    
    ```bash
    ~$ mongo
    ```
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled%203.png)
    
2. Show all database
    
    ```bash
    show dbs
    ```
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled%204.png)
    
3. Use data_science_learning_platform_databse
    
    ```bash
    > use data_science_learning_platform_database
    switched to db data_science_learning_platform_database
    >
    ```
    
4. Show collections
    
    ![Untitled](Data%20Science%20Learning%20Platform%20Deployment%20&%20Databa%204e195c9ae4f94fc3a0f20f8dc9722536/Untitled%205.png)
    
    files: store the recommend dataset.
    
    otp_for_users: store the one time pwd when user register.
    
    pending_requests: store information of not activate users.
    
    token_block_list: store information of blocked users with their token.
    
    user: store the user informations.
    
5. Manual activate user
    1. Go to register page with username and pwd
    2. Find activate code in databse
        
        ```bash
        > db.otp_for_users.find({"email":"user@rit.edu"})
        ```
        
    3. Enter corresponding otp
    4. Send username with pwd to user