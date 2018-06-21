import csv

single_names = []

names_ignore = ["SOUČET", "NEZJIŠTĚNO", "NEUVEDENO", "NEURČENO"]

'''
#shortened csv
with open('data.csv',encoding="utf8") as file:
    with open('data_filtered.csv',"w",encoding="utf8",newline='') as outfile:
        reader = csv.reader(file)
        for row in reader:
            csv.writer(outfile).writerow(row[0:1] + row[19:-2])
'''
'''
#names for autocomplete
with open('data.csv',encoding="utf8") as file:
	reader = csv.DictReader(file)
	for row in reader:
		if int(row["3000"]) > 50 and row["PŘÍJMENÍ"] not in names_ignore and " " not in row["PŘÍJMENÍ"]:
			single_names.append('"' + row["PŘÍJMENÍ"].title() + '",')

with open('nametest.csv', 'w') as file:
	for name in single_names:
		file.write(name)
'''

# longest/shortest name
with open('data.csv',encoding="utf8") as file:
    reader = csv.reader(file)
    shcount = 0
    for row in reader:
        if row[0] == row[0][::-1]:
            shcount += 1
            print(row[0])
    print(shcount)