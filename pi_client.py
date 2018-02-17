import requests

res_code = -1
num_tries = 10

url = 'http://172.31.237.179:3000/update'
#url = 'https://raspitracker.herokuapp.com/update'
payload = {'name' : 'test5',
            'ip': '17.0.0.3',
            'port': '7080',
            'status': 'on'}
while res_code != 200 and num_tries > 0:
    r = requests.get(url, params=payload)
    res_code = r.status_code
    num_tries -= 1



