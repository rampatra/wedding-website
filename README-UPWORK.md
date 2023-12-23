# Web page

https://docs.google.com/spreadsheets/d/13xKfCfW6DaBWlHnGFiS9QpoBpNLyUJLfTG8SP98J-RM/edit?usp=sharing

# Arslan Task list

1. To change the Tab icon go to the head section and find below line:
```html
<link rel="icon" type="image/png" sizes="32x32" href="img-hs/hs-wedding-logo-white-192x203.png">
```
Replace the href with the exact path to the image.

timestamp, email, name, adults, kids, extra, invite_code	

2. To change the Header Logo go to the first section and find below line:
```html
<img style="width: 200px;" src="img-hs/hs-wedding-logo-white-800x946.png">
```
Replace the src with the exact path to the image.

3. To change the Carousel Logo go to the Section containing the class "hero" and find below line:
```html
<div class="logo"><a href="#"><img src="img-hs/hs-wedding-logo-white-146x154.png" alt="Logo"></a></div>
```
Replace the src with the exact path to the image.
# Note:
I have added the style tag inside of the img tag for you so that in future if you wanted to change the logo or wanted to change the size you can do from here.

timestamp, email, name, adults, kids, extra, invite_code

# Code for RSVP

I want to use the code "081705". The following python code calculates the MD5 hash of the code.

```python
import hashlib
# String to be hashed
string_to_hash = "77777"
string_to_hash = "271117"
# Calculating the MD5 hash
print(hashlib.md5(string_to_hash.encode()).hexdigest())
```

It was working in the original code of the repo: "271117"
But I realized is not updated in the Google Script project.

# Google Script

I can share the Google Script project. I already add this code to 
https://script.google.com/macros/s/AKfycbxWVTfgmn-gfdpCybL8RYQ9Bvz9CoU2eEnT0TZxoHhY_vaO_QAKGgYFu9hSrwsgV8Ll/exec

But I don't care about that project. I only want the RSVP to be saved in my Google Sheet, and to check that the code is working.

The code should be: "081705".

# Language

Add another version for Spanish. I will translate the text.

- detection of browser language
- add a button to change the language
- I don't care if the content is duplicated in the same file, or if it is in another file.

# Menu and design

- The image has blue sky on the left, and something harder to read on the right.
I don't care if the RSVP and Venue are on the right. My only issue is visibility.


