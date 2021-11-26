import requests
import pandas as pd


def get_divorce_data():
    return pd.read_csv("./data/yearly_divorces.csv", delimiter=";")


if __name__ == "__main__":
    print(get_divorce_data())
