EmuLabeller.tierHandler = {
    init: function(params){
        this.internalCanvasWidth = params.internalCanvasWidth;
        this.internalCanvasHeightSmall = params.internalCanvasHeightSmall;
        this.internalCanvasHeightBig = params.internalCanvasHeightBig;
        this.isModalShowing = false;    
        this.tierInfos = params.tierInfos;  
        this.deleteImage = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAKQWlDQ1BJQ0MgUHJvZmlsZQAASA2d%0AlndUU9kWh8%2B9N73QEiIgJfQaegkg0jtIFQRRiUmAUAKGhCZ2RAVGFBEpVmRUwAFHhyJjRRQLg4Ji%0A1wnyEFDGwVFEReXdjGsJ7601896a/cdZ39nnt9fZZ%2B9917oAUPyCBMJ0WAGANKFYFO7rwVwSE8vE%0A9wIYEAEOWAHA4WZmBEf4RALU/L09mZmoSMaz9u4ugGS72yy/UCZz1v9/kSI3QyQGAApF1TY8fiYX%0A5QKUU7PFGTL/BMr0lSkyhjEyFqEJoqwi48SvbPan5iu7yZiXJuShGlnOGbw0noy7UN6aJeGjjASh%0AXJgl4GejfAdlvVRJmgDl9yjT0/icTAAwFJlfzOcmoWyJMkUUGe6J8gIACJTEObxyDov5OWieAHim%0AZ%2BSKBIlJYqYR15hp5ejIZvrxs1P5YjErlMNN4Yh4TM/0tAyOMBeAr2%2BWRQElWW2ZaJHtrRzt7VnW%0A5mj5v9nfHn5T/T3IevtV8Sbsz55BjJ5Z32zsrC%2B9FgD2JFqbHbO%2BlVUAtG0GQOXhrE/vIADyBQC0%0A3pzzHoZsXpLE4gwnC4vs7GxzAZ9rLivoN/ufgm/Kv4Y595nL7vtWO6YXP4EjSRUzZUXlpqemS0TM%0AzAwOl89k/fcQ/%2BPAOWnNycMsnJ/AF/GF6FVR6JQJhIlou4U8gViQLmQKhH/V4X8YNicHGX6daxRo%0AdV8AfYU5ULhJB8hvPQBDIwMkbj96An3rWxAxCsi%2BvGitka9zjzJ6/uf6Hwtcim7hTEEiU%2Bb2DI9k%0AciWiLBmj34RswQISkAd0oAo0gS4wAixgDRyAM3AD3iAAhIBIEAOWAy5IAmlABLJBPtgACkEx2AF2%0Ag2pwANSBetAEToI2cAZcBFfADXALDIBHQAqGwUswAd6BaQiC8BAVokGqkBakD5lC1hAbWgh5Q0FQ%0AOBQDxUOJkBCSQPnQJqgYKoOqoUNQPfQjdBq6CF2D%2BqAH0CA0Bv0BfYQRmALTYQ3YALaA2bA7HAhH%0AwsvgRHgVnAcXwNvhSrgWPg63whfhG/AALIVfwpMIQMgIA9FGWAgb8URCkFgkAREha5EipAKpRZqQ%0ADqQbuY1IkXHkAwaHoWGYGBbGGeOHWYzhYlZh1mJKMNWYY5hWTBfmNmYQM4H5gqVi1bGmWCesP3YJ%0ANhGbjS3EVmCPYFuwl7ED2GHsOxwOx8AZ4hxwfrgYXDJuNa4Etw/XjLuA68MN4SbxeLwq3hTvgg/B%0Ac/BifCG%2BCn8cfx7fjx/GvyeQCVoEa4IPIZYgJGwkVBAaCOcI/YQRwjRRgahPdCKGEHnEXGIpsY7Y%0AQbxJHCZOkxRJhiQXUiQpmbSBVElqIl0mPSa9IZPJOmRHchhZQF5PriSfIF8lD5I/UJQoJhRPShxF%0AQtlOOUq5QHlAeUOlUg2obtRYqpi6nVpPvUR9Sn0vR5Mzl/OX48mtk6uRa5Xrl3slT5TXl3eXXy6f%0AJ18hf0r%2Bpvy4AlHBQMFTgaOwVqFG4bTCPYVJRZqilWKIYppiiWKD4jXFUSW8koGStxJPqUDpsNIl%0ApSEaQtOledK4tE20Otpl2jAdRzek%2B9OT6cX0H%2Bi99AllJWVb5SjlHOUa5bPKUgbCMGD4M1IZpYyT%0AjLuMj/M05rnP48/bNq9pXv%2B8KZX5Km4qfJUilWaVAZWPqkxVb9UU1Z2qbapP1DBqJmphatlq%2B9Uu%0Aq43Pp893ns%2BdXzT/5PyH6rC6iXq4%2Bmr1w%2Bo96pMamhq%2BGhkaVRqXNMY1GZpumsma5ZrnNMe0aFoL%0AtQRa5VrntV4wlZnuzFRmJbOLOaGtru2nLdE%2BpN2rPa1jqLNYZ6NOs84TXZIuWzdBt1y3U3dCT0sv%0AWC9fr1HvoT5Rn62fpL9Hv1t/ysDQINpgi0GbwaihiqG/YZ5ho%2BFjI6qRq9Eqo1qjO8Y4Y7ZxivE%2B%0A41smsImdSZJJjclNU9jU3lRgus%2B0zwxr5mgmNKs1u8eisNxZWaxG1qA5wzzIfKN5m/krCz2LWIud%0AFt0WXyztLFMt6ywfWSlZBVhttOqw%2BsPaxJprXWN9x4Zq42Ozzqbd5rWtqS3fdr/tfTuaXbDdFrtO%0Au8/2DvYi%2Byb7MQc9h3iHvQ732HR2KLuEfdUR6%2BjhuM7xjOMHJ3snsdNJp9%2BdWc4pzg3OowsMF/AX%0A1C0YctFx4bgccpEuZC6MX3hwodRV25XjWuv6zE3Xjed2xG3E3dg92f24%2BysPSw%2BRR4vHlKeT5xrP%0AC16Il69XkVevt5L3Yu9q76c%2BOj6JPo0%2BE752vqt9L/hh/QL9dvrd89fw5/rX%2B08EOASsCegKpARG%0ABFYHPgsyCRIFdQTDwQHBu4IfL9JfJFzUFgJC/EN2hTwJNQxdFfpzGC4sNKwm7Hm4VXh%2BeHcELWJF%0AREPEu0iPyNLIR4uNFksWd0bJR8VF1UdNRXtFl0VLl1gsWbPkRoxajCCmPRYfGxV7JHZyqffS3UuH%0A4%2BziCuPuLjNclrPs2nK15anLz66QX8FZcSoeGx8d3xD/iRPCqeVMrvRfuXflBNeTu4f7kufGK%2BeN%0A8V34ZfyRBJeEsoTRRJfEXYljSa5JFUnjAk9BteB1sl/ygeSplJCUoykzqdGpzWmEtPi000IlYYqw%0AK10zPSe9L8M0ozBDuspp1e5VE6JA0ZFMKHNZZruYjv5M9UiMJJslg1kLs2qy3mdHZZ/KUcwR5vTk%0AmuRuyx3J88n7fjVmNXd1Z752/ob8wTXuaw6thdauXNu5Tnddwbrh9b7rj20gbUjZ8MtGy41lG99u%0Ait7UUaBRsL5gaLPv5sZCuUJR4b0tzlsObMVsFWzt3WazrWrblyJe0fViy%2BKK4k8l3JLr31l9V/nd%0AzPaE7b2l9qX7d%2BB2CHfc3em681iZYlle2dCu4F2t5czyovK3u1fsvlZhW3FgD2mPZI%2B0MqiyvUqv%0AakfVp%2Bqk6oEaj5rmvep7t%2B2d2sfb17/fbX/TAY0DxQc%2BHhQcvH/I91BrrUFtxWHc4azDz%2Bui6rq/%0AZ39ff0TtSPGRz0eFR6XHwo911TvU1zeoN5Q2wo2SxrHjccdv/eD1Q3sTq%2BlQM6O5%2BAQ4ITnx4sf4%0AH%2B%2BeDDzZeYp9qukn/Z/2ttBailqh1tzWibakNml7THvf6YDTnR3OHS0/m/989Iz2mZqzymdLz5HO%0AFZybOZ93fvJCxoXxi4kXhzpXdD66tOTSna6wrt7LgZevXvG5cqnbvfv8VZerZ645XTt9nX297Yb9%0AjdYeu56WX%2Bx%2Baem172296XCz/ZbjrY6%2BBX3n%2Bl37L972un3ljv%2BdGwOLBvruLr57/17cPel93v3R%0AB6kPXj/Mejj9aP1j7OOiJwpPKp6qP6391fjXZqm99Oyg12DPs4hnj4a4Qy//lfmvT8MFz6nPK0a0%0ARupHrUfPjPmM3Xqx9MXwy4yX0%2BOFvyn%2BtveV0auffnf7vWdiycTwa9HrmT9K3qi%2BOfrW9m3nZOjk%0A03dp76anit6rvj/2gf2h%2B2P0x5Hp7E/4T5WfjT93fAn88ngmbWbm3/eE8/syOll%2BAAAACXBIWXMA%0AAAsTAAALEwEAmpwYAAAE3mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxu%0Aczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJE%0ARiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMi%0APgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0%0AaWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI%2BCiAgICAgICAgIDx0aWZmOlJlc29s%0AdXRpb25Vbml0PjE8L3RpZmY6UmVzb2x1dGlvblVuaXQ%2BCiAgICAgICAgIDx0aWZmOkNvbXByZXNz%0AaW9uPjU8L3RpZmY6Q29tcHJlc3Npb24%2BCiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyPC90%0AaWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVu%0AdGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4K%0AICAgICAgPC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0%0APSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAv%0AIj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEyODwvZXhpZjpQaXhlbFhEaW1lbnNp%0Ab24%2BCiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U%2BMTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAg%0AICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24%2BMTI4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAg%0APC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAg%0AICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI%2BCiAg%0AICAgICAgIDxkYzpzdWJqZWN0PgogICAgICAgICAgICA8cmRmOkJhZy8%2BCiAgICAgICAgIDwvZGM6%0Ac3ViamVjdD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24g%0AcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94%0AYXAvMS4wLyI%2BCiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDEzLTA3LTI5VDExOjA3OjcyPC94%0AbXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIDIuMjwv%0AeG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8%0AL3g6eG1wbWV0YT4KHRD67gAAGSZJREFUeAHtnQeUVMWax2uYgQFmGHJUJImAKBgwra4Hx4R4YJ/y%0AMLCgmAOmVdQ1PsyKgGI8vieC4SmKigoqRtzFp2DEgDASn0MaQEAQRNLs/9fv3tl26IG%2B99a93UN3%0AnfNN93TfrvD9/5W%2B%2Bqoqp7y83GRD5mqgRuYWPVtyNJAlQIbzIEuALAEyXAMZXvxsC5AlQIZrIMOL%0An20BsgTIcA1kePGzLUCWABmugQwvft7uXP633347v2PHjnvXrFmzc15eXqcaNWrso/K2kRTJBF5P%0A/xfofb1t27bVy83NXa/367dv374hJyeH9%2Bsk/5SU6PsSfT97zZo18/fdd9/N%2Bmy3CTm7y1qAQMt5%0A/fXXC7t3736UwCoWuMVbt249aOnSpWbRokUVsmTJErNhw4YK2bhxo/ntt99MnTp1TN26dU1BQUGF%0A7LHHHqZt27YV0qpVKyMyfSmdfajkPli5cuXH3bp121Cd2VCtCQDo3333XbP69esPEOh//v333/9t%0A1qxZ5rPPPjOff/650Xdmy5Yt1vAR%2BGb//fc3hxxyiDn00ENN165dTe3atf%2BhBCYoK8%2B3aNFipbXE%0AIoqo2hEA0J944ok6xx133H8IkLM2bdrU66OPPjJvvfWW%2BfLLL41IEJHqjMnPzzcHH3yw6d27t%2BnZ%0As6cpLCx8U9l7es6cOZP0/6bIMhIgoWpDAICfNGlSY9W6KwXyTbNnz%2BZ/8%2BGHH8aa8AA6sPJTupDi%0A4mLTp08f06VLl/KioqLbNm/ePFpdyForCYQUSdoTAODffffdlh06dLhGffp/CfCcMWPGmJ9%2B%2Bikk%0AlQSPdq%2B99jLnnXcehChXqzBcY4xRyv%2BK4DHbjyFtCQDww4YNKxg4cOAtGplf%2B%2Babb%2BaMGzfOLFu2%0AzL4WQoqxZcuWZvDgwebkk08ur1ev3p3qGu5Ot64h7QgA8MKjxjfffPMnTb/Gf/vtt3kjRowwK1ak%0AZQVKijrNmjUzQ4cONZqhbNFA8RTJm0n9MIKH0ooAwr7GlClT2nfq1OmhsrKyk%2B6%2B%2B24zffr0CNQQ%0ATRKHH364ufHGG5lWviZyX6FpZWk0KVedSloQwKn1eZq6/Vnz8L8///zzOWPHjrU6hataBdF%2Bw1Ty%0AnHPOMQMGDCjX9PUUkeD1aHPwx9RSTgBqfd%2B%2BfQvuvffekZrSXXDttdfG5u9/zObu958MSGb48OFG%0A3cGDMlZdp%2BmkPYOFB3WllAACP3f8%2BPH7yKgyXk19t1tvvdWsW4cFNjOCporm9ttvN8ccc8xnsi72%0A16Ax8qlNSgjgNPm5r7766uEHHXTQq4888kjTZ555JjNQT1DKs88%2B21x11VVLZc3s1bx58%2B8SPBLa%0AR5ETwAG/puz2vWRW/btqfaHm%2BaEVsLpEfMIJJxgNejEa9W3duvW0qPIdKQEc8Gu99957A/bcc88x%0A1113Xc6MGTOiKmvap3PYYYcxLsCKGNngMDICOODna4n2P2Up%2B%2BuQIUNq/PDDD2kPStQZ1HKzeeyx%0Ax7ZphtAvihlCjSgK6IKvfr6P5sB/y4JftdapFJdeemmuBsMTS0tL/73qJ%2B18EzoB3Gb/0UcfPfqo%0Ao44aS7Ofrfk7Bw/9oCc99cbixYu77fzpYN%2BGSgAH/Jqy6Xc/6aSTXtCAryDb5ycHGHqS1bCBHFve%0AXrhwIV5MoYRQCaAc5%2B69997NTj/99GfUrzXKjva9YYi%2BHnzwwVZyOpkgX4ea3n6d3NOhEUC1P1dZ%0AKHrqqadGff31150yeZ6fHBSJn3r66aeNHF4O0YBweOIngn0ayixA4EOsulq%2BvUAmz1GnnXZaRln4%0AgkGy46%2BxGL700ktGRqI/2Z4ZWG8B3EHfJZdccrBMvCOx7ds27yoNo/X1HTWVBp%2BQL1n0rOYE/WlQ%0AaH755ZeJCxYs2Mtm5NYJoMzhat5YK17DWdXDMdNWUF9obrnlFlNSUmLmzp1rPv30U4MFLR3CGWec%0AEXNGJV%2BM4mXaNRrAWcua/CIM%2BpTr2UPWIlVEVrsAp%2Bkveuihhy5S7b%2B3X79%2B1pZ0cdf%2B6quv8MI1%0A69evN1pPN7Vq1TIymBgWkZ588kmbekk6LtzqNcsxF154ITU0Vl5aAPIloxdzeiNXtqTj29mDLCW/%0A8sorRlbUPnJZn7yzZ5P9zhpF3aa/TZs27TTfvwtnDlsu2fjrAz6Ar127NgY%2BBZTTpVm9enVsRe38%0A889PtszWngP8v/zlL%2BaCCy6I5cMtL%2BQkX7169TKPP/640aYUK2kSP3qVd9TECRMm1LERqTUCKDPE%0A1eDhhx/%2BbzVXubY8eQD/xRdfjIGfaCzhKptl1ShJ4IJPzdeOISO/xR3w4PMTTzzRKgnQK25yqmQ3%0A7pCgjw%2BsdAFO7S%2BQr/6RsvhNoem34cMH%2BJpCVgl%2BfHlpdhs1ahRJd5AM%2BPF5a9iwoXnnnXeMBsZW%0AugN8DLWUXi73%2BJb77bdfWXxaXt/bagFiAz8V8HI2aNgCf2c1v3JBo2oJvIJPPm23BOgXL%2BkGDRpc%0AXVkPXv8PTACn9tc58MAD99WmjZNx3Q4a6Oup%2BWK3pylk2CTwA76rC8YudAeyiFqZHaBn7Wu8VrOs%0Ahm4afl4DE0CJMultpPn%2BhVOnTg3st%2B8qmdF%2Boj5/V4UMiwRuvnbW5%2B8sb/weEmhNJOYUurNnk/mO%0A/RFsklH3cmUyz1f1TKAxgFP7C%2BXY2EPgfzBo0KCcIDt2UBJ9OTt4V61alXBgVVVBKn9uc0wQFPz4%0AvDGVY4agQVz8x77eswPp2WefLVcrUNC/f//f/EQStAWg9je4/PLL%2B7FXLwj4ZJ6RNAoSsQKBT1y2%0AWgKb4JMvbAJaIONt4IC%2B0bv2G/T1G5lvAji1v5YSbnHEEUccz0bNIAFFI9QObaGKjfyDxMdvg5LA%0ANvjkiR3FbF%2B3FdC7sDjbwcNztL4JoJRwWCiUV29XWab2YZeujYDSsexhSaMZDxr8kiAM8DEIsbCD%0A5dBWcHZHn6RuoJmfOIMQAHQannvuuX21XBl4izbNPoL9HFbfcMMNsXl9KkgQFviQGmMVh1fYCpxu%0Agv4V9wA/cfoigNPc1FaCzdQCHMrc30aAAACOaD0hJSQIC3yMQcwgJk6cGCO6DX25caB/VZz%2BDi7u%0Ax0m9%2BiKAYuZ3jP47aI16D07msBEgAM0kQksQTwIbK2u76g7CBJ/zAgAfclNOm8E5GeWI5557zvMa%0AeRAC1D/llFOOZOnT1rEsKAagmQkgLgnYUdu4cePY/0EVVxUJAJ%2Bxh995fqJ8QWRqPuC/9tprFcS2%0ATQD0Dw5agfXsReyZAMo89MU/rUGPHj262RzRosREJBg9enRsW3UYJAAcF/yLLrqoyoUd8uYlRAW%2B%0AmydwkAW12MHH/XiXr54JoBghAEuRTWSqbWdzQOPmNkoS3HHHHbE19uoMPnoDB3UvxXrrqX/xS4AC%0AuT610higqU2PH5cAvEZFgp9//tkccMABMftDoiXd%2BDwl8z7qmu/mCRyU/wNGjRqV736WzKsfAvCb%0AAu1j68whjK4TRDKJeX2mKhLcdNNN1sYEgM7BkXQDQUOqwCff4AAexx9/fEcv5fBDAOb/hTrGpe0i%0AncAZdkhEAvnKG5sksFGGVILv5h88NHju7P6fzKsnAggMdwBYr127di2iIACFSHcSpAP46Ak8NA7o%0A4uDER7sMngig2CAAfUw97WFvHBUBKEW6kiBdwEdH4KGpcyfUxf/JBK/eii4Bipo2bVrEsm2UIZ4E%0ApEu/R3dAuOuuuwwDOhsDuViESfxJJ/DJLniIAOwjDJUArADWk8NG/q%2B//kq6kYZ0IUG6gQ8I4CH9%0AFOltaAQgHYxAdUWAmoyeUxGqIgGf33nnnaG3BOkIPjhw9L1CIX%2BSDX66AH5TSztU8pwEk03L6nOJ%0ASPDAAw/E0giTBOkKPgWnQmoQyCUYobYADBxrppoAFDgRCWQI4SuDhQ/nEptjgnQGnzJTITUGgABJ%0AB6%2BzACLmN9JFXh5r0akO8SRgAYnVNkjw8ccfx24BsZk/9ilof16oCztB8gseMmjV9RKHVwLQtMQI%0AoG1ZWzkjPx2CSwJqKMKM4MgjjwzspFK5bDSxOuI15tTBSiXpplMAD%2BWJgVnSGfNKAMobI4GOdd1G%0AjUiX4JLgtttuM1deeaW1Vb348rlLyffdd58ZPHhw/Fdp8R48lMfYSDDZDHklAAZzZLuam63s2E2X%0AgC3/5ptvNpdddlko4LvldElwzz33GE74TKcAHg4BwCip4JUARMouyK1qAdKGAIDP2gBbsavaqJmU%0ANpJ8KF1JAAE06PU0N/dNAI04t6RDCxA1%2BC5H0pEETgvgyTrnlwBbli9fvpF79VIZUgW%2BW%2BZ0IwF4%0AyD3Mk33eKwHoWzjuYrMWHta3bdvW1UXkr6kG3y1wOpEAPGQOXqC8hToG4GKDjfPmzVuTKgKkC/jp%0ARgLw0J7KeW6%2Bknn10wJwd%2B56bd9anQoCpBv4rpLToSUAD7XMc5Sn0FoAIuZqznW61WuVzqyLuW%2B7%0ASgj7NQzwMRxxtBuGnaAhlSTACgoeOpjzR5UjdAKs1zRwo3anruMu3ShCWODjt6/LK2I%2BhpiRg4ZU%0AkQAchEmJDtbg5vNwCCAQiJgxAIls/OKLL1ZxkXLYIUzwucELuf76663vRYzSWAQOus18hrDY4uCU%0AFCx%2B2r1tipm55hotuCzXbpSkEvL7UJjgsymEc/eo%2BTrdrFqTABx0iujH0jP4JB38EABLINamlbr6%0ApZQbLtjzHkYIG3z26nEekbuKqMurqiUJ0D9X2etMwmnCAXySDn4IQDcAAcp0hs9ajTrXcoW67RA2%0A%2BOzVA3gGgbwiDASrIwnQvyyzP%2Bjo3JXCIen%2BH8z8EgBHgFWSdWoFlvXu3Zu4rAXAZ0OoTds%2BQCfa%0AqAnoSBQk4JTPMBaQ0L8q4jsCAFzCJYDAcQeCXHG2QocULejZs6c15wui53h5m6t6VYHvrue7S8lh%0Ak4CFKgaG%2BCrYCvgAoP9x48a9rDg9DQDJg58WgN/Rz/wikSfykpXamryquLiYzwMFwEeo/Ry8bMOd%0Aa1fguxmOigQcdH3NNde4yQZ%2BRe86fu6rl19%2BeaEi89T/k3gQAjATWCxZpcFUaZ8%2BfYgvUAB8GK0r%0AVK3sOUwWfDfTUZCAvfw6VMtNMvAretfZwVxADR7REEBA0Q1skqyQLNFtFgs7d%2B5sOLcuSKDG00xy%0ARmBQo4xX8N18h00C8jV//nw3uUCv6LtLly7lcoF7TRFtcnDxFKffFoBEmG%2Bukfwk76CfdXjxfObV%0AfsO/OCUKiwSMxDlNy2/wC76bXlgkIF4OisLmYCOgb50T%2BKJuFVuu%2BDzN/930gxCAVoBmp1SyTFu0%0A5uoW7Fjz7Ubu5RXlEHgdOXKk0ezC6DBkL1HEng0KvpugbRIQH6eZy1Yf8yx20/H7SjeJvuWf%2BFfF%0AAQ7g4Tn4JoDT3LAyCPsWqNkumzx58qIgzpJMx2j6aQXOPPPMWFfghQS2wHe1aIsELvjcAIbJmf%2BD%0ABvSswfdk3S/I8u9mP80/efBNAKcANDtMB8nEUvnj/8iclPPs/QQUA4gIR6qqf0uaBLbBd/MflAT8%0AHvsD4DP6h%2BBBCYB%2B0bNOUXtC%2BUT/vpp/yhiIAA7rMD7ghjRPJ1SUaUawcOjQocTtOaAYFOTOx5Ml%0AQVjguwXwSwIXfO5MBHzySSsXlADod%2BbMmZN0QOT3yuNvfms/5QtEAEdBsG%2B1ZK5k8bBhw2ZrabJc%0ABxg7X3t78UoClMrAigFRmEexeSVBIvBt1H70Kv1uv%2BKKK0ZLs%2Bjdd%2B0HmcAEiGsFflJ8JVqTXiFr%0A10yMOdRkP6EqEnCVKgMpQOcZbAY0r1zaFCb4bhl2RQIWZXiGBSby6Tb75NcG%2BOgTvWoFc3RZWRnd%0AbqDaT7kCE8BRzla9/iyZLZkvq9QiLISss/sNiUigO4gNO3/YA0c/KH8Eo3uKIgHfLUdVJDj11FOx%0Ax8fypRu/zZAhQyqafRvgkz761Pa02VpTGK9/0Td6DxQCXRgRn7IUk6v/m0owcx3boUOHrm%2B88UZP%0ANVUmyFFyamFix75zGghjAtc8HA%2BErb41vjy7ek%2B%2ByIubLzyB3EA/T56osbbA1xW8DPrKtUZyoU4I%0An6y0VioP/5%2Bom7jHV1stAMlihmREWiKZI2vXUl3l9s39998fyKhTuSVAqa5yaWpTAb7KF2vq3VVE%0A16cgPl98Zgt8jGLDhw8348aN%2B5vA/0TJo2fPZl/yXTlYawGIWGBBKEx43SXHSfYTaw9u0qRJa65S%0ADRKocfECMeIlSNxBfhufJ97H54n3NgLnIKm1mTFw4MDrFd83knVKywoBbLYAAESmcBZhgPK1pFRT%0Alu%2B1Y2XdWWedpX/9B5TpGoqoadQuG1Mq/zn61y/Dzhf%2BA%2B3bty%2B7%2BOKLRypF9LrBFviUgONebAd3%0AQMgctaHOESjUFG2mRumHaTtZPiP5bEhOA1yMrYHfRl0yMUo7fqj5VgZ%2B8albJ4DYWa5agYl4qWSm%0ApKF2EdVRQb6WQaSH1vnzZL6Mz0P2fQIN6ChebkrffPXVVz/%2BySeffKBH0Kdvk2%2BCJGIfWe0C3ESc%0AJgoLIU4KX0jm6DTrxbpdbCaHK%2BBImg1VawD9oCddTP2cbghlxI8emfNb6ffjUw6FACSgzDJFWSdh%0Aq9J0Scn7779fqnn8t1ruLc%2BSQBpJENAL%2BtEdzBPGjx//kh5Bfwz6Ak/5EiQXyhggPh0yjbmS8QAH%0ATNbUfcAx0ukK1W6sjGW7A2nFCTT71Hz5C0yUi/ez%2Bhi9BTb3uvEnerU%2BBohPRKxlPMBOIjyIGcSQ%0AXi6XQutY1y0qaHd5s%2BRlB4bGMODTETdbZOp9Rc411Hz0hd48O3rqN0mHUAlALhwSMCjEfYypIWGb%0AuoPtmhpuGTt27IG6eCKfFbNMDUz1Bg8evElu8C/I0DNJekBP6Mv6oK%2Byjq0agipHHv%2B/WgKsImwh%0AwlkAQ9Fhkk4yGbeQl0w3rR0UcWmTnwujFU%2B1DFj4ZC3Fl3K11g6e145r5sjUfMD/ncoTdsFCGwRW%0AzrhTmN/1eZnkK8k0yfcyGS/Wgs4MeRSVyrmUpU59vPsHykl5RfgSlf8Rgc9oH72gn0jAR8uRtQAk%0ARnBaAtaJG0k6S3pI9pU012rfnmoFur3wwgtGXYMV13DFm1aBtQxW9XB50zrJB7LvT1EGY1NlvTLg%0AC7XPr6yMyAlABhwSsHpYJGknOUBCt9BaZs8mUkxnmY%2BbsJVq%2BnRmkLtHwJmD9XxZRJfpdYp8%2Bv6h%0AkmEsY57PlHlbFM2%2B0qkIKSGAm7qIAAnqSFpJ9pMcKGkvadSvX7%2BWUlI3LSXnjBgxwqxYQbdYPQO%2B%0AC7hx4Sklj%2Bf/1XnDdH8M9JjmYeHDyBPKPF9x7zSklADkTCRgHIKNoLFkb0k3SSdJK91JUCRrWAc5%0AW7Tlflw1l2bZsmX6qnoEXLc1uo85cOpC7Dnq3v5Hu3hnKfffSljYwbbPSN%2B6hU/xJhVSTgBy6XQJ%0ATEk5e5bWAAJ0lXSQNJEii2QTb6NtUG2mTp1qxowZY3Q8jb5Kz8COHXwU8dsXcefpHoMvSktLAR7B%0AX4Jaz6rp1qibfKX5h5AWBHBzFNcaNNBne0m6SCDDnpKGujq2UH4FbdQ9tNMpZbFr5jVvtn4quNLy%0AHPBPLC4uNuzVY5uczh0qkZv8TB3bskCRATrucrB2rSSltV7pV4S0IgC5cloDugXGBnQLEKGjhO6B%0A1qGRuoa6/fv3b66uoaVOxmgs92hqmnFu0dYj0QScQDmcAR/9nj17sk1rpZa9/ykb/hz5LZYqFzTz%0AeEsDPM09C2TbU13rlYeKkHYEcHMW1y1ABKaMe0ggQXtJSwmtRKG6h4JBgwa1lCm1Wbt27epzizYX%0AKXOXLr6I%2BOzZCkzhmL9zIBNn8rBwI0fQtRySoXMS5sqYVaa0GKRQ6wF/iYSpHcCnvLlXHnYIaUsA%0AN6cOEXL1P0QA9BaS1hJaBkjRRMJ0sk5hYWH%2Bscce2%2Bjoo49uJJAatmnTph7XqQqkChFIsdu1uPyB%0AK1YQvIxpwjlvH%2BHQZcVlOHu3bdu2FcI5fByNJ3KtnjZt2kqZs5dqv/8apY3NHrCp6dT85RKaeoCP%0AfGqnNJMOaU8AtyRxRGDGUChpKMGszPgAIvAeIvAdg8naaqLzVEsL1CcXdOzYsUA2hrpad6gtgPME%0AeK4kT4DnqmbnqqXYJjJsExm2SraJIFs1X9%2Bknbcbfvzxxw0lJSXrZs2atUb7%2B9cr7l8lzNuZmwL8%0AYuc9ZOC7zZK0Bl75i4VqQ4CKDIsJeo/QKtSWAHh9Ca0DrUFzSVMJBKkr4RlIky%2BpKeF3SA1HiAub%0A%2B3ZHmI8j9B2YrgFzk2SjBIA5iImmnlpPLf9FAug8w%2B/o4kO34SsdK6HaESC%2B1E6r4AIJuHQT1H4E%0AYtRzhJaB9xACMvCsSwZ%2BD/gu6AAP6ABObaem8%2BrWfKZvCM07z8aIU51AV54rQrUmQEUp9MYhg9s6%0AACq1HJCp%2BYgLPPYGlzS8Vm4BAHSrxCUCrQDC/5CE76nh1aqmK78Jw25DgESlq0QKgCa4r5Xfxzfb%0A7vsY0HpwtwCbAlcOuzUBKhc2%2B/%2BOGqAJzIYM1kCWABkMPkXPEiBLgAzXQIYXP9sCZAmQ4RrI8OJn%0AW4AsATJcAxle/GwLkOEE%2BD/Z7/0%2BaAC/OAAAAABJRU5ErkJggg%3D%3D%0A";
        this.resizeImage = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAKQWlDQ1BJQ0MgUHJvZmlsZQAASA2d%0AlndUU9kWh8%2B9N73QEiIgJfQaegkg0jtIFQRRiUmAUAKGhCZ2RAVGFBEpVmRUwAFHhyJjRRQLg4Ji%0A1wnyEFDGwVFEReXdjGsJ7601896a/cdZ39nnt9fZZ%2B9917oAUPyCBMJ0WAGANKFYFO7rwVwSE8vE%0A9wIYEAEOWAHA4WZmBEf4RALU/L09mZmoSMaz9u4ugGS72yy/UCZz1v9/kSI3QyQGAApF1TY8fiYX%0A5QKUU7PFGTL/BMr0lSkyhjEyFqEJoqwi48SvbPan5iu7yZiXJuShGlnOGbw0noy7UN6aJeGjjASh%0AXJgl4GejfAdlvVRJmgDl9yjT0/icTAAwFJlfzOcmoWyJMkUUGe6J8gIACJTEObxyDov5OWieAHim%0AZ%2BSKBIlJYqYR15hp5ejIZvrxs1P5YjErlMNN4Yh4TM/0tAyOMBeAr2%2BWRQElWW2ZaJHtrRzt7VnW%0A5mj5v9nfHn5T/T3IevtV8Sbsz55BjJ5Z32zsrC%2B9FgD2JFqbHbO%2BlVUAtG0GQOXhrE/vIADyBQC0%0A3pzzHoZsXpLE4gwnC4vs7GxzAZ9rLivoN/ufgm/Kv4Y595nL7vtWO6YXP4EjSRUzZUXlpqemS0TM%0AzAwOl89k/fcQ/%2BPAOWnNycMsnJ/AF/GF6FVR6JQJhIlou4U8gViQLmQKhH/V4X8YNicHGX6daxRo%0AdV8AfYU5ULhJB8hvPQBDIwMkbj96An3rWxAxCsi%2BvGitka9zjzJ6/uf6Hwtcim7hTEEiU%2Bb2DI9k%0AciWiLBmj34RswQISkAd0oAo0gS4wAixgDRyAM3AD3iAAhIBIEAOWAy5IAmlABLJBPtgACkEx2AF2%0Ag2pwANSBetAEToI2cAZcBFfADXALDIBHQAqGwUswAd6BaQiC8BAVokGqkBakD5lC1hAbWgh5Q0FQ%0AOBQDxUOJkBCSQPnQJqgYKoOqoUNQPfQjdBq6CF2D%2BqAH0CA0Bv0BfYQRmALTYQ3YALaA2bA7HAhH%0AwsvgRHgVnAcXwNvhSrgWPg63whfhG/AALIVfwpMIQMgIA9FGWAgb8URCkFgkAREha5EipAKpRZqQ%0ADqQbuY1IkXHkAwaHoWGYGBbGGeOHWYzhYlZh1mJKMNWYY5hWTBfmNmYQM4H5gqVi1bGmWCesP3YJ%0ANhGbjS3EVmCPYFuwl7ED2GHsOxwOx8AZ4hxwfrgYXDJuNa4Etw/XjLuA68MN4SbxeLwq3hTvgg/B%0Ac/BifCG%2BCn8cfx7fjx/GvyeQCVoEa4IPIZYgJGwkVBAaCOcI/YQRwjRRgahPdCKGEHnEXGIpsY7Y%0AQbxJHCZOkxRJhiQXUiQpmbSBVElqIl0mPSa9IZPJOmRHchhZQF5PriSfIF8lD5I/UJQoJhRPShxF%0AQtlOOUq5QHlAeUOlUg2obtRYqpi6nVpPvUR9Sn0vR5Mzl/OX48mtk6uRa5Xrl3slT5TXl3eXXy6f%0AJ18hf0r%2Bpvy4AlHBQMFTgaOwVqFG4bTCPYVJRZqilWKIYppiiWKD4jXFUSW8koGStxJPqUDpsNIl%0ApSEaQtOledK4tE20Otpl2jAdRzek%2B9OT6cX0H%2Bi99AllJWVb5SjlHOUa5bPKUgbCMGD4M1IZpYyT%0AjLuMj/M05rnP48/bNq9pXv%2B8KZX5Km4qfJUilWaVAZWPqkxVb9UU1Z2qbapP1DBqJmphatlq%2B9Uu%0Aq43Pp893ns%2BdXzT/5PyH6rC6iXq4%2Bmr1w%2Bo96pMamhq%2BGhkaVRqXNMY1GZpumsma5ZrnNMe0aFoL%0AtQRa5VrntV4wlZnuzFRmJbOLOaGtru2nLdE%2BpN2rPa1jqLNYZ6NOs84TXZIuWzdBt1y3U3dCT0sv%0AWC9fr1HvoT5Rn62fpL9Hv1t/ysDQINpgi0GbwaihiqG/YZ5ho%2BFjI6qRq9Eqo1qjO8Y4Y7ZxivE%2B%0A41smsImdSZJJjclNU9jU3lRgus%2B0zwxr5mgmNKs1u8eisNxZWaxG1qA5wzzIfKN5m/krCz2LWIud%0AFt0WXyztLFMt6ywfWSlZBVhttOqw%2BsPaxJprXWN9x4Zq42Ozzqbd5rWtqS3fdr/tfTuaXbDdFrtO%0Au8/2DvYi%2Byb7MQc9h3iHvQ732HR2KLuEfdUR6%2BjhuM7xjOMHJ3snsdNJp9%2BdWc4pzg3OowsMF/AX%0A1C0YctFx4bgccpEuZC6MX3hwodRV25XjWuv6zE3Xjed2xG3E3dg92f24%2BysPSw%2BRR4vHlKeT5xrP%0AC16Il69XkVevt5L3Yu9q76c%2BOj6JPo0%2BE752vqt9L/hh/QL9dvrd89fw5/rX%2B08EOASsCegKpARG%0ABFYHPgsyCRIFdQTDwQHBu4IfL9JfJFzUFgJC/EN2hTwJNQxdFfpzGC4sNKwm7Hm4VXh%2BeHcELWJF%0AREPEu0iPyNLIR4uNFksWd0bJR8VF1UdNRXtFl0VLl1gsWbPkRoxajCCmPRYfGxV7JHZyqffS3UuH%0A4%2BziCuPuLjNclrPs2nK15anLz66QX8FZcSoeGx8d3xD/iRPCqeVMrvRfuXflBNeTu4f7kufGK%2BeN%0A8V34ZfyRBJeEsoTRRJfEXYljSa5JFUnjAk9BteB1sl/ygeSplJCUoykzqdGpzWmEtPi000IlYYqw%0AK10zPSe9L8M0ozBDuspp1e5VE6JA0ZFMKHNZZruYjv5M9UiMJJslg1kLs2qy3mdHZZ/KUcwR5vTk%0AmuRuyx3J88n7fjVmNXd1Z752/ob8wTXuaw6thdauXNu5Tnddwbrh9b7rj20gbUjZ8MtGy41lG99u%0Ait7UUaBRsL5gaLPv5sZCuUJR4b0tzlsObMVsFWzt3WazrWrblyJe0fViy%2BKK4k8l3JLr31l9V/nd%0AzPaE7b2l9qX7d%2BB2CHfc3em681iZYlle2dCu4F2t5czyovK3u1fsvlZhW3FgD2mPZI%2B0MqiyvUqv%0AakfVp%2Bqk6oEaj5rmvep7t%2B2d2sfb17/fbX/TAY0DxQc%2BHhQcvH/I91BrrUFtxWHc4azDz%2Bui6rq/%0AZ39ff0TtSPGRz0eFR6XHwo911TvU1zeoN5Q2wo2SxrHjccdv/eD1Q3sTq%2BlQM6O5%2BAQ4ITnx4sf4%0AH%2B%2BeDDzZeYp9qukn/Z/2ttBailqh1tzWibakNml7THvf6YDTnR3OHS0/m/989Iz2mZqzymdLz5HO%0AFZybOZ93fvJCxoXxi4kXhzpXdD66tOTSna6wrt7LgZevXvG5cqnbvfv8VZerZ645XTt9nX297Yb9%0AjdYeu56WX%2Bx%2Baem172296XCz/ZbjrY6%2BBX3n%2Bl37L972un3ljv%2BdGwOLBvruLr57/17cPel93v3R%0AB6kPXj/Mejj9aP1j7OOiJwpPKp6qP6391fjXZqm99Oyg12DPs4hnj4a4Qy//lfmvT8MFz6nPK0a0%0ARupHrUfPjPmM3Xqx9MXwy4yX0%2BOFvyn%2BtveV0auffnf7vWdiycTwa9HrmT9K3qi%2BOfrW9m3nZOjk%0A03dp76anit6rvj/2gf2h%2B2P0x5Hp7E/4T5WfjT93fAn88ngmbWbm3/eE8/syOll%2BAAAACXBIWXMA%0AAAsTAAALEwEAmpwYAAAE3mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxu%0Aczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4xLjIiPgogICA8cmRmOlJE%0ARiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMi%0APgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0%0AaWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI%2BCiAgICAgICAgIDx0aWZmOlJlc29s%0AdXRpb25Vbml0PjE8L3RpZmY6UmVzb2x1dGlvblVuaXQ%2BCiAgICAgICAgIDx0aWZmOkNvbXByZXNz%0AaW9uPjU8L3RpZmY6Q29tcHJlc3Npb24%2BCiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyPC90%0AaWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVu%0AdGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4K%0AICAgICAgPC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0%0APSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAv%0AIj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEyODwvZXhpZjpQaXhlbFhEaW1lbnNp%0Ab24%2BCiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U%2BMTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAg%0AICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24%2BMTI4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAg%0APC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAg%0AICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI%2BCiAg%0AICAgICAgIDxkYzpzdWJqZWN0PgogICAgICAgICAgICA8cmRmOkJhZy8%2BCiAgICAgICAgIDwvZGM6%0Ac3ViamVjdD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24%2BCiAgICAgIDxyZGY6RGVzY3JpcHRpb24g%0AcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94%0AYXAvMS4wLyI%2BCiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDEzLTA3LTI5VDExOjA3OjU1PC94%0AbXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIDIuMjwv%0AeG1wOkNyZWF0b3JUb29sPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8%0AL3g6eG1wbWV0YT4KdOwIZAAAGStJREFUeAHtnQeQVUW6x3uYgQEmkKMKDMgS1MGI%2Bp66MKClsOqq%0Ai6kMKJYJRZ8P5ZWriNaaEDFjoQ8ZwwMUEShMiyIGDBgRQRiXtAxBMg6CSJr3/x1uj5fLcOeGc%2B6c%0Aw9yv6quT%2B3R/37%2B/Tl93Z5SXl5s01VwJ1Kq5SU%2BnHAmkAVDDcZAGQBoANVwCNTz5aQuQBkANl0AN%0AT37aAqQBUMMlUMOTn7YAaQDUcAnU8ORnHczpf%2Bedd7I7dux4eO3atTtnZWV1qlWr1p%2BU3rbifHWB%0A5%2Bk6R%2Bd5u3fvzsvMzNyi8y179uzZmpGRwXmZ%2BN/iEj0v0fMFmzZtWty1a9cdunfQUMbBMhYgpWVM%0AnTo1t1u3bqdIWUVSbtGuXbuOXbVqlVm2bFkFr1y50mzdurWCt23bZn777TdTr149U79%2BfZOTk1PB%0AhxxyiGnXrl0Ft27d2ghM30hmH%2Bh3M9atWzersLBwa5DREGgAoPQffviheYMGDS6V0v/2%2B%2B%2B//8f8%0A%2BfPNl19%2Bab766iujZ2bnzp2u6UfKN0cddZQ54YQTTPfu3c0RRxxh6tat%2B6l%2BMFFRGdeyZct1rv0s%0ARQEFDgAoffTo0fV69%2B59rhRyxfbt28/88MMPzdtvv22%2B%2BeYbIxCkSHTGZGdnm%2BOOO8706dPH9OjR%0Aw%2BTm5r6l6L24cOHCabrenrKIJPGjwAAAxU%2BbNq2Jct0tUvLfFyxYwLX54IMPHBOehAxc%2BZQipKio%0AyJx99tmmS5cu5fn5%2Bffu2LHjCRUhm135gUeB%2BB4AKH769OmtOnTo8N8q0/9LCs8YM2aMWb58uUci%0AST7YNm3amAEDBgCIclmF4apjjFT81yYfsvsh%2BBYAKH7YsGE5l1122d2qmd/%2B1ltvZRQXF5vVq1e7%0ALoVjjz3WfPvtt66H26pVK9O/f3/Tt2/f8ry8vH%2BoaHjAb0WD7wCA4qWJWt9///1f1fyaMHfu3KwR%0AI0aYtWu9yUCnnHKKmTRpEkoyX3/9tesgIMDmzZubwYMHG7VQdqqieJ74LU9%2BlECgvgKAdF/r3Xff%0Abd%2BpU6cn16xZc9YDDzxgvvjiiwSSVfUnNH%2BVK83HH39sGjZsaNSkMz179jQ0C72ik046ydx55500%0AK6cI3IPUrCz16l%2BxhusLAIRyfZaabn9TO/z/xo0blzF27FhXm3CRAlGxYp566ilzzjnnmLKyMqOm%0ApHn99dednBr5rpvXNCWvuuoqc%2Bmll5brn%2BcJBFPdDD/esKp9LIBcLyXk/vjjj8%2BoLT/u5ptvznju%0Auec8VT65/6yzzjL9%2BvUzW7bQ6aduP4FASjGnn356vDKM6336JUjfoEGDMmTlpqhO85iar7XjCsTF%0Al6vVAkj5mRMmTPiTOlUmyNQXDh061FGEi%2BnbLyiU37hxYzNv3jzzyy%2B/7AO0OnXqGDXfjHr3zIYN%0AG/b71u0b/Ou%2B%2B%2B6j6PlS8eqnSmPKmzbVYgEw%2BaKsN95442SVix%2BNGjWq8NZbb/Vc%2BSgQADz22GNG%0AHUj7KJ9narc7HUmPPvool54TVod0jxw5srvi9bkswlGe/zTiBykHAJpXHGqr377P0Ucf/c5dd93V%0A7KWXXoqIljeXKP/iiy826kU0v/76a6U/oUjg%2BSWXXFLpcy9uvvjii2bIkCGtBcCPS0tLT/XiHwcK%0AM6VFQEj5dd57771LDz300DF33HFHxuzZsw8UN1fvo3wGc%2Bgu1qieUafSAcPXyKFp1KiRodaeyg6n%0AE0880QwfPpxexJRVDlNmAULKz9YQ7WVSxP/ecMMNKVM%2BmgYAzzzzjNNtrCaYwRBZjkQC4KA5SCtB%0Ao4qRjz27JjMgF9VNJmkU81zPfhQWcEpSZ5UvU3%2B22sDPDxw4sJZq/WHR8PaUJh8mndE7lGuHftVN%0A6/QBUCls2rSpadKkiWnWrJnTcUMfARZAcfU2chGhI5cbb7wxU/WDyakoDjwvAkLKr6Pc92c1vd64%0A5ZZbclJl9pEtOZ8cT/ML5hq2xOAN7f%2BbbrrJPP/8885tcj3tdZjioDqI4kAy2yz5/VnF5Vyv4uCp%0ABQgpv7b69LtJ%2BePVzEup8iOFpn4GA6NUONy823sceQeKBEtkeF5ek0nUa9hQcXxn6dKleDF5Qp4C%0AQDHOPPzww5tfdNFFL6mp11ijep4kIlqgAqGjaNr4jN/LgcNhzsnhljiPfGaBYN9J9RF5Pf74460V%0Ar4ledRZ5BgAJnmyU/8ILL4z87rvvOqWqqVeZksjpNudztMx9WxzYe/ZoLQQAqk6iiSiHlxNUcR7u%0ARTw8AYCERrj1iouLr1RFqx89fH4hFGqVytECADDYZ/a5X%2BKM/H7%2B%2BedbvWgZuA4ACY8sU0fNmePU%0Axfvo7bffnpIevkSVRQsBAgB%2BJXoM1WdC1/XkJUuWtHEznl6kmmpzE414DWdUD8dMP5MFgN9yfaTM%0A5BdhkKeasE9GPkvm2lUASIiEl/Pkk09eJsF2Z0jX7xReBPg9rshTPZPnyrX9L27F1TUAWNPftm3b%0AAnnZ3I8zh5su2W4lODKcIAEAeSJXeUdNnjhxYr3ItCRy7RoA9HPCaqju0/%2BRucr0ypMnkURG%2ByYo%0ARYBNA3LFTU6Z7E57L5mjKwAI5X589bvJnetCfPj8TrbMtxbAXvs93sQP%2BWo08%2B/yaWiRbHxdAYAi%0A4VT8VPO/mQkaXjlwJpvYyr63FsDPrYDIeCNfvKTly3hb5LN4r5MGgM39xxxzTFcNtvRV2z/eOFTr%0A%2B0EEAAJDzhqxvF2trEbJCDBpAOjn9Pg1Vnv/2pkzZ3rit59MAqv61gIgSEUAaWJ%2BBJNk5LdwS1Vp%0AjPY8KQDY3C8/9wJZgHOZsRM0snWAIBUBVsbIW3WBocm0CJICgCJC7m8oT94LmKuXSu8ZK4Rkj9YC%0ABBEAyBu5y2/hnETlkPBgdyj319GPW5588smnv/zyy4nGISXfMaW7V69eBoWT6/ERgFu02FuRZvwd%0AnwCe2Xc4ylHTyH8xJXFM5CdMkFXarpQ%2BXlPc/3B0iDGwhB1C9EOsR1PNq%2Bsj1%2B6x%2BNOz0IIfCbmw%0A%2BMNHH31kmK%2BH9284cc1wcLgV4BzPIeYKzJgxI/x1X50TR/lY4s3c8sgjj1wTb%2BSSKQIw/42uvvrq%0AczRc6Wvlk5OZA3Dttdc6jiD4%2B%2BEVbBkAsGoIHsGWESRDse%2B//368Mk3p%2B2Q65M8iGYn8OCEAhMx/%0AXf2wuSxAd9r%2BfidA8Mknnxh8/pkGFo1wFsH0y2U92mu%2BeYb8ZbH6hfQSV7wSAoD%2BwHe5qv13UBl6%0ACK7WfiUJxRnnx6RzzkwcVZwc815ZnHmPGTvXXXedb61aZLyRv4qAk1955ZW8yGdVXScDgAbnnXfe%0Af%2BLFmsplWapKUGXPUTyePnj54BXcv39/Z2Yw9yIJ5Ws001ljyIIm8h2/XSN/9CD/i7gnlcQNgJCZ%0AwZmu4fHHH1/Igkx%2BJwCAMq3jpxZqcBwsIosCKlSLFy82Dz30kAMYvgsKoQf5PRaF9BNztOMGgEJG%0AKgxFNlWts4DVuIJA4SAg5zNJ5NNPP3WWhCP%2B3GMuABVFO3EkCOmycUQPSkORruNCbaIAyJGwWqsO%0A0MzvHj9WQBwBAYrGEnB%2BzTXXOEUCTUCsAfUDrENQTH942tCDKrpHa6Jpdvj9qs4TAQDf5KjjpDOL%0AMAbB6cMKIdIKEH9m5zIzSJ7L5umnnw6k8kkfeiA96o/paNMbyzERAFBzytW4f7tlWoEzaBRuBbAG%0Ar776qsFl/frrr3eSwvOgEvqQNescT/zjAoCEg3SoAOYVFBS0DCIAEA7JsBVCjhrLcGYBB9H0kx5L%0A6EOg7hLSk70d9RgXABQSAKCMyTvssMOaBBUASMSCgPIfxhrsxTdPg0noQyDupNjHbMbiHQyyAMjX%0ALNp8Fl4OKqFsm%2BM5D7ry0QP6UJqYR%2BgpABgBzNN8tWz60oNMB4virQ7Qh9KUr2vPAMC/qAPUFwBq%0AM4ASjehPT5N7ErBD1wcKMbTGYe6Bnld2P5EigG/qqNcsK/TD/cK1Y%2Bo80Jy2/Z6nb8QvAfW5VPkR%0AGVJ1GTbBiNkCxFsJJBJ8UzsaABh5ixxz58M0eSsBMqTqAAAgZkoUAGo9ZWVV5gBC7ofpTk2TuxJA%0ArtEIfeid%2BtHeiXwWLwAwLXyTpRy%2Bi8GTNPlHAuhDlUAqZp4WAQ4ItNDibtys0uQfCaAPWd64VruO%0A1wJgg%2BA9Mje72GApTf6RAPoIASB6WREW5XgBwKesqLBLFiANgDBB%2BuEUAKgCHr1tHhHRhAGgGufO%0AtAWIkGY1X4YsQFy9c/H2A5BELMBOte%2B3sa9eVRRL%2B7WqMNLPY5MA%2BpB7WFz98/ECgLKFRXZ3aOBh%0AS7t27aLGDO/aNCUvAUYsWcKOAatohD7UHbxE78RcB4gXAPyfnRi3LVq0aNOZZ57J9T5k%2B9eriuw%2B%0AH6UvokrAjlQi22gEANavX78o2juRz%2BIFAMhiWs0WuU5ttE4UkYEyysbCjFV1XER%2Bl76uXAIoHplW%0ARQBAG18t1HueWQACZmvOMu3qtZ7l1xlLj3QLI8KgNg2AqlQW2/Oqcj6hoAf0oYU5f9JlzACoGlb7%0AxtECYIuagds0O7WMvXQPREQ8CMz2r36O54HkG34fPUgnJfJtZBMkbwCgHE3A1AH4yTaZm/XMug0y%0AsW%2Bg9jAwmuMQ5GQ4G1pr67vZSsTOkJ5iSk%2B8FoBAGeWhrblp1qxZP7OLdhAJLLNfALOAGEZlnkCQ%0Au7bRg1YRnSVdxDUKlwgA6Aegt2mdpiWXdu3a1VmFO2ggAAD333%2B/szUMM4JxtmBeQBCJ5jabYTz7%0A7LOfKP7oJ2ZKBAAUAwBgjdaw3az%2BgM2UoUEilF9d%2BwZ6ISfkr57ZHz///PN1Cj/m8p%2B4JAoAVoJY%0ALy6TFVjdp08fwgoEoXwmgqi2bDZv3lzRUuE%2BawgUFxc7W8cEIjGhSCJ/ZcR/6hK9eAsACcpWBDfr%0AZ2u1NMySHj16HHC6dSiOvjkQfb/sG%2BiGUPABQP4C7usKL64KIP9PxALwHeXML2J5Iq9cp6nJ64uK%0Airjva0L5ftw3MBmhIXdZsm%2B179FShRNX%2Bc9/kwEALYEV4vWTJ08uZfMlPxPKp6NEW7A4pj5aXCkK%0AWEmkTZs20V7zxTPkrrWDWcUKfaQGABImxcB28Vrxytdee21p586dfS0wokxTD785O/3bdv4oDftQ%0Ade0buE8kYrgAoF26dClXa2aKXt8e0ksMX/7xSqIWgBBob24SL5dQN2gf4MUDBgzgvu8IL%2BWg7BsY%0Aj/CQt5a7eVW7iuF7H1f73/4nmWXiGJrCK/QI8V%2B08WJ3dQydqR3CfLVcLDmfHM94Bcw1bMmv%2Bwba%0A%2BB3oyHJ3zGy%2B8sori7TFHD2Av6XUAoR%2Bxsgg6FuiYcg1b7755rL%2B/fvr0p/EABXM%2BDocPsJm73Hk%0AHSgSLH5KFXJW5ftN6Z7h3x2JKJ/0JFME8D1mh%2BYgkVil1Sl%2Bok3avHlzXfqDKOft8DQ9ZjhWwJwz%0AgmaJ88hnFgj2Hb8ckS9yVjf2aMUJ%2BSdk/klPUgAIoY7OB9yQFmmFijVqESwdPHgwYfuGAIDN%2BRwt%0Ac59cDtl79mgtBADyGyHfOXPmTNMCkfMUt4RMv01TUgAIBQL6Nor/JV4xbNiwBRqaLGfjZT9SeM2f%0AcwsAwGCf%2BVHpVpbIVfLdM2jQoCd0D7knnPsJM2kAhFmB5QqvRGPSax988ME52vd2HxPLz/xItBAg%0AAOB3ophCrpMmTXpCM68pdpPK/aTXrVTvUlgbxAvEi9UrtYweQu0dqEt/kwWAn3O9lSDy1ND1Au0c%0ANkH3kDdyT4pcAUCEFZivGK3STpfzaXtH8xhKKuYufRxeBLgUpCfBFBYWsnI5nT4j9QOsbdK5n4i6%0AAgACEmFLqZGWiBdqxc1VGl///pFHHnHW3tU9X1IQAMDytcOHDzfFxcXPa5uYzyRI5Bx3t29lCnAN%0AACErQL/AKjH7xS5RR8VSdQ6V%2BtnRIghFAPJTm3%2B2QDAuJN%2BE2/36fh9yDQCEKhCASpxFqKB8Jy5V%0Ak2WeZqyUXXHFFbr0D9ky31oAe%2B2fGO6NiXr6TPv27dfIBf9R3UGuW0NydiWq8c4LiOWntkJIG7WR%0A1hHIVZ/1nClTppyo6WTZ06dPjyWMlL1jLYAfWwFnnHGGUcVvm5a0HakZP99LKK5U/MKF6zoAKAqU%0Am2xRMEc/a6RZRPWUkO%2B0IufxGmrN2tt1HR6N6jv3KwDYw%2Bjuu%2B/ecdtttz372WefzZCEKFpdM/1W%0A4q4WATbQkImihxAnha/FC7Wa9QqtyDnn4YcfNjiS%2BoUsAPxUBCAf5HTPPfe8oh1C35SskCO1flcq%0AfuGy9wQA/ECRpYeqTMxUpS/EJdp/p/Tee%2B%2Bdq0WZy/0CAsVTUfNPRxByQT7yXZiozbheU9SQX1lI%0AnkTVVXK9CIiIne0mpj5QR1xbLQMHdKNGjSocMmSIqe7iwFoAP9QBMPvkfO3APlku3i9LXsgt6e5e%0AhXFA8hQAQi31AWYS4UFMJYb/ZTKOvWHDhp1KaDd1bGSlomLo930DqfBpk6qd6uqdJOcacj7yQm5x%0AO3rqm5gpYYeQmP%2BgFwUChtRYLKCl%2BBgxI0UdpZRWY8eOPUYdHNks2e4VYeb9vG8gTT2N729XHWm8%0AOnqmSQ40ofGz%2BJ1M5JVcCDclAHB%2B9AcIcBboJj5R3KlDhw4t5aNfqLGD/KFDhxpNNuF11wj5Yebx%0ACmL6FPMA5bzi3Iv2E3YQka%2Bj0abYzihhtHcTfUYPH5088u3bOHDgwHGacU0bmZyPr6XnyifenlUC%0ACTycQkhmavka8bfiT8Tz1GW8onfv3rOllFIE7tXYASDw076BpJP0CvAlSv/TUj61feSCfFKifP0n%0AdRaAn0Gh4gBXnMbizuLjxbQLW8if8FBZgcLx48cbFQ37rTugdxIilI%2BnL8vXUtkDCAUFBZXuC8jz%0AJk2aOB437MfH9V7jldCv9/uIIV1G9Rgo0zjJDBV/7%2Bolp6msIxU%2BT8v8yAilzALYH4csga0YztX9%0AmeJPxYtVOVwiJ81Z2op%2Bvca8jVtOJSgQTx%2B8fKpz30DSQ7o0FX11v379xkr540PpRw6eV/j0j/0o%0AZXWA/f6sG1IM3pd4FrcWHymmgthe3PiCCy5opRpxoXbDyhgxYoRZu5ZiMXGiLkA9ACuAdzA7hWtc%0A3WzcSKbbS0yzWrFihSkqKnLqCG41DfHhw41LZr9cE04%2BHjduHMUfFT2aefTw0cmTlGePwkiIqhUA%0AxFggwArRR9BEfLi4UNxJ3FpOmvnqDetw/vnnt2N/XOWYpFzOw4sCzgmThSFCy6w7pv/UU081JSUl%0Arph%2BXLdVu3eKE23zvlDF20eaxYu/BDmegR369unedb2HT%2BHGRNUOAGIpENBMpI%2BAtWexBgCA%2BQYd%0AxE0lyHz1ibdV8dB25syZZsyYMc4mT3oWF2EFULydI4CCtMqJc49NI7EI6ptwiou9UYor%2BIqXmbHD%0ApI2ePXsCskWajPp1aWkpiofxlyDXM2q6S3HytJmnf0QlXwDAxjDMGjTUvTbiLmLAcKi4kSpnudrn%0Ar62KhwI2eFSuMmo3V1qZ0/uVEvK2RQH1gQsvvNCxLGy92rdvX6fCl4jpp/ig6GCiCdPkpk6dWiI3%0A%2BTlatmWJIoLScZdbLsaZo1pzvf5fQb4CALEKWQOKBeoGFAsAoaOY4gHr0FhFQ31VolqoaGillTGa%0AyD3aMeehXbT1SnQCBNYKAILRo0c7k0aVS%2BMy/cwtYHEGfPR79OjBNK11Gvb%2Bt/rwF2q6XKligZnH%0AWxrFY%2B4ZINtT3blecagg3wHAxiwEBIoFgECT8RAxIGgvbiXGSuTKjOdcfvnlrdSV2rygoKABu2iT%0Am9lLl%2B1UUXRlZIsCAECOp3lGSyGa6ecd2u90K9OpxMDNMq2QwiIZWifhX%2BrMWqN/rRaT61H%2BSjG1%0ATBRf7eZecdiPfAsAG9MQEDJ1DRBQOt3Jh4mxDICiqThfXE%2BLPmX36tWr8WmnndZYSmrUtm3bPLZT%0AlZIqWEpiOVXDukD0OnIEJCwYBdNlzKLLnLP2brt27SqY6eUsjSdwbVRfwjqNbq7S95v0b5pwKJuc%0ATs6nGxdTj%2BJ3%2BynHKz77kO8BYGMbBgRaDLniRmK6lakfAATOAQLPqEzWlYnOUi7NUZmc07Fjxxy5%0AVtXX4tV1peAsPctUvwAWJlNK53y3FlrezT4I4t1qGeySB9N2zbzd%2BtNPP21Vy6Bs/vz5m/TOFn3z%0Aq7hMTNsUxa8InQMGnu0Q%2B1rxip9DgQFARYT32mhaDViFumIU3kCMdcAatBA3EwOQ%2BmLeATTZ4tpi%0AvoNrhfEenVumPQ5TdtB1jTK3i7eJUfA6MaaeXE8u/0WM0nmH78jw1VqzVxxipsABIDxlIatgFYly%0AKSbI/TDAyAsxloFzAAEYeNeCge9RvlU6ikfpKJzcTk7naHM%2BzTcY8867DnCCpHTFuYICDYCKVOgk%0ABAYsA4xSyeUomZwPW8Vj9i1oOPI%2BOdZaAI67xBYIWAGYa0DCc94PVE5XfCulgwYAlaUuAhQoGrLH%0AyPNws23PHUXrxYNC2SQ4kg5qAEQmNn29vwQwgWmqwRJIA6AGK5%2BkpwGQBkANl0ANT37aAqQBUMMl%0AUMOTn7YAaQDUcAnU8OSnLUANB8D/A2X0QClyvKu2AAAAAElFTkSuQmCC%0A";
        this.iconImageSize = 12;
        this.isSelected = false;
        this.lastSample = 0;
        this.myHistoryCounter = 0;
        this.myHistory = new Object();
        this.editAreaTextfieldName = "editArea";
        this.tierCssName = "tierSettings";
        this.cans = params.cans;
        this.historyEndError = "Cannot go back, no more history saved.... =(";
        
    },
    
    history: function() {
        this.myHistory[this.myHistoryCounter] = jQuery.extend(true, {}, this.tierInfos);
        ++this.myHistoryCounter;
    },
    
    goBackHistory: function() {
        if((this.myHistoryCounter-1)>0) {
            delete this.tierInfos;
            this.tierInfos = jQuery.extend(true, {}, this.myHistory[this.myHistoryCounter-2]);
            --this.myHistoryCounter;
            this.rebuildTiers();
            emulabeller.drawBuffer();
        }
        else alert(this.historyEndError);
    },    

    addTier: function(addPointTier) {
        var my = this;
        var tName = "Tier" + (this.getLength()+1);
        
        if (!addPointTier) {
            var newTier = {
                TierName: tName,
                type: "seg",
                events: []
            };
        } else {
            var newTier = {
                TierName: tName,
                type: "point",
                events: []
            };
        }
        this.addTiertoHtml(tName, this.tierCssName, "#"+this.cans.id);
        this.tierInfos.tiers[tName] = newTier;

        // save history state
        this.history();
        
        emulabeller.drawer.updateSingleTier(this.tierInfos.tiers[tName]);
        
    },

    addLoadedTiers: function(loadedTiers) {
        var my = this;
        $.each(loadedTiers.tiers, function() {
             my.addTiertoHtml(this.TierName, my.tierCssName, "#"+my.cans.id);
             my.tierInfos.tiers[this.TierName] = this;
        });
        // save history state
        this.history(); 
    },

    getLength: function() {
        var r = 0;
        var t = this.tierInfos.tiers;
        for (var k in t) r++;
        return r;
    },

    getCanvas: function(name) {
        return $("#" + name)[0];
    },

    getCanvasContext: function(name) {
        return this.getCanvas(name).getContext('2d');
    },
    
    /**
     * append a tier
     *
     * @param myName is used ad id of canvas
     * @param myID is used in custom attr. tier-id
     * @param myCssClass is used to spec. css class
     * @param
     */
    addTiertoHtml: function(myName, myCssClass, myAppendTo) {

        var buttons = "<div class='buttons'><a href='#' id='"+myName+"_del' class='deleteButton'><img src='"+this.deleteImage+"' /></a><a href='#' id='"+myName+"_res' class='resizeButton'><img src='"+this.resizeImage+"' /></a></div>";
        var myCan = $('<canvas>').attr({
            id: myName,
            width: this.internalCanvasWidth,
            height: this.internalCanvasHeightSmall
        }).addClass(myCssClass).add(buttons);
        
        $('<div class="hull'+myName+'" style="position:relative;">').attr({id: "hull"+myName}).html(myCan).appendTo(myAppendTo);        

        $("#" + myName).bind("click", function(event) {
            emulabeller.tierHandler.handleTierClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getTier(emulabeller.getTierName(event.originalEvent)));
        });
        
        $("#" + myName+"_del").bind("click", function(event) {
            var n = $(this).parent().prev().get(0).id;
            if(confirm("Wollen Sie '"+n+"' wirklich loeschen?")) 
                emulabeller.tierHandler.removeTier(n);
        });        
          $("#" + myName+"_res").bind("click", function(event) {
            var n = $(this).parent().prev().get(0).id;            
            emulabeller.tierHandler.resizeTier(n);
        });        
        
        $("#" + myName).bind("dblclick", function(event) {s
            emulabeller.tierHandler.handleTierDoubleClick(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), this.id);
        });
        $("#" + myName).bind("contextmenu", function(event) {
            emulabeller.tierHandler.handleTierClickMulti(emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent), emulabeller.tierHandler.getTier(this.id));
        });
        $("#" + myName).bind("mousemove", function(event) {
           curSample = emulabeller.viewPort.getCurrentSample(emulabeller.getX(event.originalEvent));                
           if (emulabeller.tierHandler.isSelected && event.shiftKey) {
                emulabeller.internalMode = emulabeller.EDITMODE.LABEL_RESIZE;
                emulabeller.tierHandler.removeLabelDoubleClick();
                emulabeller.tierHandler.moveBoundary(curSample, emulabeller.getTierName(event.originalEvent));
                emulabeller.drawer.uiDrawUpdate();
            }
            else if (emulabeller.tierHandler.isSelected && event.altKey) {
                emulabeller.internalMode = emulabeller.EDITMODE.LABEL_MOVE;
                emulabeller.tierHandler.removeLabelDoubleClick();
                var border = emulabeller.tierHandler.moveSegment(curSample, emulabeller.getTierName(event.originalEvent));
                emulabeller.drawer.uiDrawUpdate();
            }
            else {
                emulabeller.tierHandler.trackMouseInTiers(event, emulabeller.getX(event.originalEvent), emulabeller.getY(event.originalEvent),emulabeller.getTierName(event.originalEvent));
            }
            emulabeller.tierHandler.lastSample = curSample;
        });
        $("#" + myName).bind("mouseout", function(event) {
            emulabeller.tierHandler.isSelected = false;
            emulabeller.viewPort.curMouseMoveTierName = "";
            emulabeller.viewPort.curMouseMoveSegmentName =  "";
            emulabeller.viewPort.curMouseMoveSegmentStart = "";
            emulabeller.viewPort.curMouseMoveSegmentDuration = "";
            emulabeller.drawer.updateSingleTier(emulabeller.tierHandler.getTier(emulabeller.getTierName(event.originalEvent)));
        });
        $("#" + myName).bind("mouseup", function(event) {
            //myMouseUp(e);
        });
        $("#" + myName).bind("mousedown", function(event) {
            //myMouseDown(e);
        });

    },
    
    /**
     * function called on mouse move in tiers
     *
     * @param percX x position percentage of
     * canvas calling this function
     * @param tierID id of canvas calling this function
     */
    trackMouseInTiers: function(event, percX, percY, tierName) {
        var curTierDetails = this.getTier(tierName);

        var curSample = emulabeller.viewPort.sS + (emulabeller.viewPort.eS - emulabeller.viewPort.sS) * percX;
        var event = this.findAndMarkNearestSegmentBoundry(curTierDetails, curSample);
        if(null != event) {
            emulabeller.viewPort.curMouseMoveTierName = curTierDetails.TierName;
            emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(curTierDetails,event.label,event.startSample);
            emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
            emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
            emulabeller.tierHandler.isSelected = true;    
        }

        emulabeller.drawer.updateSingleTier(curTierDetails, percX, percY);
    },

    findAndMarkNearestSegmentBoundry: function(t, curSample) {
        var closestStartSample = null;
        var closestStartEvt = null;
        var e = t.events;
        for (var k in e) {
            if (closestStartSample === null || Math.abs(e[k].startSample - curSample) < Math.abs(closestStartSample - curSample)) {
                closestStartSample = e[k].startSample;
                closestStartEvt = e[k];
            }
        }
        return closestStartEvt;
    },   
  
    rebuildTiers: function() {
        for(t in this.tierInfos.tiers) {
            this.removeTierHtml(this.tierInfos.tiers[t].TierName);
            if(null==document.getElementById(this.tierInfos.tiers[t].TierName)) {
                this.addTiertoHtml(this.tierInfos.tiers[t].TierName, this.tierCssName, "#"+this.cans.id);
            }
        }
    },    
    
    removeTierHtml: function(tierName) {
        $("#"+tierName).remove();
        $("#"+tierName+"_del").remove();
        $("#"+tierName+"_res").remove();
    },
      
    
    removeTier: function(tierName) {
        this.removeTierHtml(tierName);
        delete this.tierInfos.tiers[tierName];
        // save history state
        this.history();
    },
      
    
    removeSegment: function(t,labelName,labelStart) {
        var id = emulabeller.viewPort.getId(t,labelName,labelStart);
        var halfSize = this.tierInfos.tiers[t.TierName].events[id].sampleDur/2;
        delete this.tierInfos.tiers[t.TierName].events[id];
        
        if(null==this.tierInfos.tiers[t.TierName].events[id-1]) {
            this.tierInfos.tiers[t.TierName].events[id+1].sampleDur += 2*halfSize;
            this.tierInfos.tiers[t.TierName].events[id+1].startSample -= 2*halfSize;        
        }
        else if(null==this.tierInfos.tiers[t.TierName].events[id+1]) {
            this.tierInfos.tiers[t.TierName].events[id-1].sampleDur += 2*halfSize;
        }
        else {
            this.tierInfos.tiers[t.TierName].events[id-1].sampleDur += halfSize;
            this.tierInfos.tiers[t.TierName].events[id+1].sampleDur += halfSize;
            this.tierInfos.tiers[t.TierName].events[id+1].startSample -= halfSize;
        }
        t.events.sort(function(a, b) {
            return parseFloat(a.startSample) - parseFloat(b.startSample);
        });
        
    },
      
    removeBorder: function(t,labelName,labelStart) {
        if(null!=this.tierInfos.tiers[t.TierName].events[labelName-1]) {
            this.tierInfos.tiers[t.TierName].events[labelName-1].sampleDur += this.tierInfos.tiers[t.TierName].events[labelName].sampleDur;
            this.tierInfos.tiers[t.TierName].events[labelName-1].label += this.tierInfos.tiers[t.TierName].events[labelName].label;
            delete this.tierInfos.tiers[t.TierName].events[labelName];
        }
    },
      
    
    removePoint: function(t,labelName,labelStart) {
        for(s in this.tierInfos.tiers[t.TierName].events) {
            if(this.tierInfos.tiers[t.TierName].events[s].label == labelName &&
               this.tierInfos.tiers[t.TierName].events[s].startSample == labelStart) {
                   console.log(this.tierInfos.tiers[t.TierName].events[s]);
                   delete this.tierInfos.tiers[t.TierName].events[s];
            }
        }
    },
    
    deleteSelected: function() {
        var my = this;
        var t = this.getSelectedTier();
        var selected = emulabeller.viewPort.getAllSelected(t);
        var warn = "Wollen Sie ";
        for(s in selected) warn+=selected[s].label+", ";
        if(confirm(warn.substring(0,warn.length-2)+" wirklich loeschen?" )) {
            for(s in selected) {
                if(t.type=="seg")
                    this.removeSegment(t,selected[s].label,selected[s].startSample)
                if(t.type=="point") 
                    this.removePoint(t,selected[s].label,selected[s].startSample)
            }
            t.events.sort(function(a, b) {
                return parseFloat(a.startSample) - parseFloat(b.startSample);
            });
            this.history();
            emulabeller.drawBuffer();
        }        
    },
    
    
    deleteBorder: function() {
        var my = this;
        if(emulabeller.viewPort.curMouseMoveTierName!="") {
            var t = this.getTier(emulabeller.viewPort.curMouseMoveTierName);
            if(confirm("Wollen Sie die Grenze bei '"+this.tierInfos.tiers[t.TierName].events[emulabeller.viewPort.curMouseMoveSegmentName].label+"' wirklich loeschen?" )) {
                this.removeBorder(t,emulabeller.viewPort.curMouseMoveSegmentName)
                t.events.sort(function(a, b) {
                    return parseFloat(a.startSample) - parseFloat(b.startSample);
                });
                this.history();
                emulabeller.drawBuffer();
           }        
        }
    },
    
    resizeTier: function(tierName) {
        var s = this.internalCanvasHeightBig-1;
        if($("#"+tierName).height() >= s)
            $("#"+tierName).height(this.internalCanvasHeightBig/2.9);
        else
            $("#"+tierName).height(this.internalCanvasHeightBig);
    },      

    handleTierClick: function(percX, percY, tierDetails) {
        //deselect everything
        emulabeller.viewPort.setSelectTier(tierDetails.TierName);
        emulabeller.viewPort.resetSelection(tierDetails.events.length);
        this.removeLabelDoubleClick();
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);
        
        var rXp = canvas.width * percX;
        var rYp = canvas.height * percY;
        var sXp = canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
       
        if (tierDetails.type == "seg") {
            var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));           
            if(null!=nearest) {
                emulabeller.viewPort.curMouseMoveTierName = event.label;
                emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
                emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
                emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
            }
        } 
        
        if (tierDetails.type == "point") {
            var nearest = this.findNearestPoint(tierDetails, emulabeller.viewPort.getCurrentSample(percX));           
            if(null!=nearest) {
                emulabeller.viewPort.curMouseMoveTierName = event.label;
                emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.MouseSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
                emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
            }
        }         
        
        emulabeller.drawBuffer();
    },
    
    
    
    handleTierClickMulti: function(percX, percY, tierDetails) {
        
        //deselect everything
        if(emulabeller.viewPort.getSelectTier() != tierDetails.TierName) {
            emulabeller.viewPort.setSelectTier(tierDetails.TierName);
            emulabeller.viewPort.resetSelection(tierDetails.events.length);
        }        
        this.removeLabelDoubleClick();
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);
        
        var rXp = canvas.width * percX;
        var rYp = canvas.height * percY;
        var sXp = canvas.width * (emulabeller.viewPort.selectS / (emulabeller.viewPort.eS - emulabeller.viewPort.sS));
       
        if (tierDetails.type == "seg") {
            var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));
            if(null!=nearest) {
                emulabeller.viewPort.curMouseMoveTierName = event.label;
                emulabeller.viewPort.curMouseMoveSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.MouseSegmentName = emulabeller.viewPort.getId(tierDetails,event.label,event.startSample);
                emulabeller.viewPort.curMouseMoveSegmentStart = event.startSample;
                emulabeller.viewPort.curMouseMoveSegmentDuration = event.sampleDur;
                if(emulabeller.viewPort.setSelectMultiSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true) == false) {
                    this.handleTierClick(percX, percY, tierDetails);
                }
            }
        }
        emulabeller.drawBuffer();
    },
    

    findNearestSegment: function(t, curSample) {
        var e = t.events;
        var r = null;
        for (var k in e) {
            if (curSample > e[k].startSample && curSample < (e[k].startSample + e[k].sampleDur)) {
                r = e[k];
            }        
        }
        return r;
    },

    tierExists: function(name) {
        var t = this.tierInfos.tiers;
        for (var k in t) {
            if(t[k].TierName==name) return true; 
        }
        return false;
    },
    

    findNearestPoint: function(t, curSample) {
        var e = t.events;
        var r = null;
        var temp = emulabeller.viewPort.eS;
        for (var k in e) {
            var diff = Math.abs(curSample-e[k].startSample);
            if (diff<temp) {
                temp = diff;
                r = e[k];
            }        
        }
        return r;
    },

    nextSegment: function(t, curSample) {
        var e = t.events;
        var r = null;
        var temp = 0;
        for (var k in e) {
            var diff = curSample-e[k].startSample;
            if (diff>temp && diff>0 && diff < e[k].sampleDur) {
                temp = diff;
                r = e[k];
            }        
        }
        return r;
    },

    
    getSelectedTier: function() {
        return this.tierInfos.tiers[emulabeller.viewPort.getSelectTier()];      
    },
    
    getSelectedTierType: function() {
        if(null==this.tierInfos.tiers[emulabeller.viewPort.getSelectTier()]) return false;
        return this.tierInfos.tiers[emulabeller.viewPort.getSelectTier()].type;      
    },
    
    getTiers: function() {
        return this.tierInfos.tiers;    
    },
    
    getTier: function(t) {
        return this.tierInfos.tiers[t];    
    },
    
    
    createEditArea: function(myName,x,y,width,height,label,c,saveTier) {
        var my = this;
        var textAreaX = Math.round(x) + c.offsetLeft + 2;
        var textAreaY = c.offsetTop + 2 + y;
        var textAreaWidth = Math.round(width);
        var textAreaHeight = Math.round(height);
        var content = $("<textarea>").attr({
            id: "editing"
        }).css({   
            "top": textAreaY+ "px",
            "left": textAreaX+"px",    
            "width": textAreaWidth+ "px",
            "height": textAreaHeight+"px"     
        }).addClass(this.editAreaTextfieldName).text(label);
        
        $("#hull"+myName).prepend(content);        
        
        emulabeller.internalMode = emulabeller.EDITMODE.LABEL_RENAME;
        
        $("#editing")[0].onkeyup = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 13) {
                if(saveTier)
                    my.saveLabelName(this);
                else
                    my.saveTierName(this);
                my.removeLabelDoubleClick();
            }
        };
        
       this.createSelection(document.getElementById("editing"), 0, label.length); // select textarea text     
        
    },
        

    handleTierDoubleClick: function(percX, percY, myName) {
        var my = this;
        tierDetails = this.getSelectedTier();
        emulabeller.viewPort.setSelectTier(tierDetails.TierName);
        emulabeller.viewPort.resetSelection(tierDetails.events.length);
        var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
        var cc = emulabeller.tierHandler.getCanvasContext(tierDetails.TierName);        
        var edit = $('#'+this.editAreaName);
        if (edit.length === 0) {
            if (tierDetails.type == "seg") {
                var nearest = this.findNearestSegment(tierDetails, emulabeller.viewPort.getCurrentSample(percX));
                emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
                var posS = emulabeller.viewPort.getPos(canvas.clientWidth, emulabeller.viewPort.selectS);
                var posE = emulabeller.viewPort.getPos(canvas.clientWidth, emulabeller.viewPort.selectE);
                this.createEditArea(tierDetails.TierName,posS,0,posE - posS - 5,canvas.height / 2 - 5,nearest.label,canvas,true);
                
            } else if (tierDetails.type == "point") {
                var nearest = this.findNearestPoint(tierDetails, emulabeller.viewPort.getCurrentSample(percX));
                emulabeller.viewPort.setSelectSegment(tierDetails,nearest.label,nearest.startSample,nearest.sampleDur,true);
                emulabeller.viewPort.select(nearest.startSample,nearest.startSample);
                var posS = emulabeller.viewPort.getPos(canvas.clientWidth, emulabeller.viewPort.selectS);
                var editWidth = 45;
                this.createEditArea(tierDetails.TierName,posS-((editWidth-5)/2),canvas.height / 8,editWidth- 5,canvas.height / 4 - 5,nearest.label,canvas,true);
            }
        } else {
            my.removeLabelDoubleClick();
        }
        emulabeller.drawBuffer();
    }, 

    createSelection: function(field, start, end) {
        if (field.createTextRange) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
        } else if (field.setSelectionRange) {
            field.setSelectionRange(start, end);
        } else if (field.selectionStart) {
            field.selectionStart = start;
            field.selectionEnd = end;
        }
        field.focus();
    },

    saveLabelName: function(a) {
        var tierDetails = this.getSelectedTier();
        var content = $("#editing").val();
        tierDetails.events[emulabeller.viewPort.getSelectName()].label = content.replace(/[\n\r]/g, '');  // remove new line from content with regex
        emulabeller.drawer.updateSingleTier(tierDetails);

        // save history state
        this.history();
        
    },

    saveTierName: function(a) {
        var my = this;
        var tierDetails = this.getSelectedTier();
        var old_key = tierDetails.TierName;
        var new_key = $("#editing").val().replace(/[\n\r]/g, '');

        if(!this.tierExists(new_key)) {
            var backup = jQuery.extend(true, {}, tierDetails);
            delete this.tierInfos.tiers[old_key];
            $("#"+old_key).attr("id",new_key);
            my.tierInfos.tiers[new_key] = backup;
            my.tierInfos.tiers[new_key].TierName = new_key;
            emulabeller.drawBuffer();
            // save history state
            this.history();              
        }
        else {
            alert("Fehler : Ein Tier mit diesem Name ('"+new_key+"') existiert bereits!");
        }
        
    },

    renameTier: function() { //maybe rename to removeLabelBox or something
        var my = this;
        var tierDetails = this.getSelectedTier();
        if(null!=tierDetails) {
            var canvas = emulabeller.tierHandler.getCanvas(tierDetails.TierName);
            var posS = emulabeller.viewPort.getPos(canvas.clientWidth, 0);
            this.createEditArea(tierDetails.TierName, 0, posS,canvas.clientWidth - 5,canvas.height / 2 - 5,tierDetails.TierName,canvas,false);
        }
        else {
            alert("Bitte waehlen Sie zuerst ein Tier aus!");
            console.log(this.tierInfos);
        }
        
    },   

    addSegmentAtSelection: function() {

        var sT = this.getSelectedTier();
        if(null!=sT) {
            if(sT.type=="seg"){ 
                var me1 = this.nextSegment(sT,emulabeller.viewPort.selectS);
                var me2 = this.nextSegment(sT,emulabeller.viewPort.selectE);
                if(me1==me2) {
                    alert("todo"); 
                }
                else {
                    alert("Hier duerfen Sie kein neues Segment einfuegen!");
                }
            }
            else if(sT.type="point") {
                if(emulabeller.viewPort.selectS==emulabeller.viewPort.selectE) {
                
                }
                else {
                    alert("Auf einem Punkte Tier koennen keine Segmente eingefügt werden!");
                }
            }
            else {
                alert("Unbekannter Tier Typ");
            }
        }
        emulabeller.drawBuffer();
    },
    
    removeLabelDoubleClick: function() {
        var my = this;
        $('.'+this.editAreaTextfieldName).remove();
    },    

    moveBoundary: function(newTime, myName) {
        newTime = Math.round(newTime);
        if(null!=this.tierInfos.tiers[myName]) {
            var left = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName-1];
            var me = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName];
            var right = this.tierInfos.tiers[myName].events[emulabeller.viewPort.curMouseMoveSegmentName+1];
            emulabeller.viewPort.select(newTime,newTime);
            if (this.tierInfos.tiers[myName].type == "seg") {
                var old = me.startSample;
            
                // moving at the center
                if(null!=left && null!=right) {
                    if (newTime > left.startSample && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                        left.sampleDur += (newTime-old);                    
                    }
                }
                // moving the last element
                else if (null!=left) {
                    if (newTime > left.startSample && newTime < (emulabeller.viewPort.eS-20)) {
                        left.sampleDur += (newTime-old);                    
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                
                }
                // moving the fist element
                else if (null!=right) {
                    if (newTime > (emulabeller.viewPort.sS+20) && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                }
            } else {
                oldTime = me.startSample;
                if(null!=left && null!=right) {
                    if (newTime > left.startSample && newTime < right.startSample) {
                        me.startSample = newTime;
                    }
                }
                // moving the last element
                else if (null!=left) {
                    if (newTime > left.startSample && newTime < (emulabeller.viewPort.eS-20)) {
                        left.sampleDur += (newTime-old);                    
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }   
                 }
                // moving the fist element
                else if (null!=right) {
                    if (newTime > (emulabeller.viewPort.sS+20) && newTime < right.startSample) {
                        me.startSample = newTime;
                        me.sampleDur -= (newTime-old);
                    }
                }
            }
        }
    }, 
      

    moveSegment: function(newTime, myName) {
        changeTime = Math.round(newTime-this.lastSample);
        var t = this.tierInfos.tiers[myName];
        var doMove = false;
        var first = true;
        var last = 0;
        var startS = 0;
        var l = emulabeller.viewPort.countSelected();
        if(null!=t) {
            var selected = emulabeller.viewPort.getAllSelected(t);
            for(var i=0;i<selected.length;i++) {
                if(null!=selected[i]) {
                    if(first) {
                        if( ( t.events[i].startSample + changeTime>=t.events[i-1].startSample ) && 
                            ( t.events[i+l-1].startSample + t.events[i+l-1].sampleDur + changeTime<=t.events[i+l+1].startSample ) ) {
                            doMove = true;
                            t.events[i-1].sampleDur += changeTime;
                            startS = t.events[i].startSample;
                        }
                        first = false;
                    }
                    if(doMove) {
                        t.events[i].startSample += changeTime;
                    }
                    last = i+1;
                }
            }
            if(doMove) {
                t.events[last].startSample += changeTime;
                t.events[last].sampleDur -= changeTime;
                emulabeller.viewPort.select(startS,t.events[last].startSample);
            }
        }
    }
};
