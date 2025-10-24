import pandas as pd


DataPath = r"C:\Users\mkb00\PROJECTS\GitRepos\PortfolioSite\data\submissions.parquet"



Data = pd.read_parquet(DataPath)
Data.to_csv("Data.csv", index=False)
print("CSV complete")