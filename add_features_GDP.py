import pandas as pd
import numpy as np
#Read Annual GDP Growth data in NL
df=pd.read_csv('data\GDP_Annual_Growth_NL.csv', sep=' ')
#Read Annual divorce data in NL
df_yearly_div=pd.read_csv('data\yearly_divorces.csv', sep=';')
#Group the annual divorce data in NL by summing them up per year!
df_yearly_div=df_yearly_div.groupby(['Perioden'],as_index=False).sum()
#Change name of colum "Perioden" to "Year"
df_yearly_div.rename(columns={"Perioden": 'Year'},inplace=True)
#Let us change the values of the divorces to percentage changes except years
col=df_yearly_div.columns
col_1=col[1:-1]
col_1=col_1.insert(-1,col[-1]) 
df_yearly_div[col_1]=df_yearly_div[col_1].pct_change()
#Take the Annual GDP Growth in NL from 1988 onwards (same as minimal year in divorce data)
df=df[df.Year>=2000]
df=df[df.Year<=2016]
#Merge two datasets using the year as common attribute
df_final=(pd.merge(df, df_yearly_div, on='Year'))
#Add a column for total divorces(men and women)
df_final['total_divorces']=df_final['scheidende mannen']+df_final['scheidende vrouwen']
df_final['Crisis_label']=""
df_final.Crisis_label[0:8]="Pre-Crisis"
df_final.Crisis_label[8:13]="Crisis"
df_final.Crisis_label[13:17]="Post-Crisis"
#change the name of some columns:
df_final.rename(columns={"Totaal huwelijkssluitingen": 'Totaal_huwelijkssluitingen','scheidende mannen':'divorced_men','scheidende vrouwen':'divorced_women'},inplace=True)
#We need to add labels of pre/peri/post crisis years: 2000-2008,2008-2012,2013-2016
df_final.to_csv("./data/merged_data_GDP.csv", index=False)
