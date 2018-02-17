import requests

res_code = -1
num_tries = 10

url = 'http://localhost:3000/update'
payload = {'name' : 'test4',
            'ip': '127.0.0.1',
            'port': '80',
            'status': 'on'}
while res_code != 200 and num_tries > 0:
    r = requests.get(url, params=payload)
    res_code = r.status_code
    num_tries -= 1



