import pandas as pd


def get_divorce_data():
    return pd.read_csv("./data/yearly_divorces.csv", delimiter=";", header=[0], index_col=[0, 1])

def get_mariage_information(df, period, period_name):
    period_df = df[(df.index.get_level_values('Perioden') >= period[0]) & (df.index.get_level_values('Perioden') >= period[-1])]
    period_df = period_df.groupby("Regio's").mean().sum().to_frame().transpose()
    period_df["period_name"] = period_name
    period_df.set_index("period_name", inplace=True)
    return period_df

if __name__ == "__main__":
    pre_crisis_years = list(range(2000, 2008))
    crisis_years = list(range(2008, 2012))
    post_crisis_years = list(range(2013, 2016))

    df = get_divorce_data()

    pre_crisis_df = get_mariage_information(df, pre_crisis_years, "pre_crisis_years")
    crisis_df = get_mariage_information(df, crisis_years, "crisis_years")
    post_crisis_df = get_mariage_information(df, post_crisis_years, "post_years")
    
    df = pd.concat([pre_crisis_df, crisis_df, post_crisis_df])
    # df = df.set_index(["Regio's", "period_name"])
    # df = df.stack(0)
    # df.columns = ['regions', 'period_name', 'label_name', 'value']

    print(df)

    df.to_csv("./data/preprocessed_divorces.csv", index=True)

