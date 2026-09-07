import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

URL = "https://in.bookmyshow.com/movies/mumbai/raaka-telugu/ET00494565"

print("Opening RAAKA BookMyShow page...")

options = Options()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    driver.get(URL)

    print("Waiting for page...")
    time.sleep(10)

    html = driver.page_source

    with open(
        "raaka_page.html",
        "w",
        encoding="utf-8"
    ) as file:
        file.write(html)

    print("\nPage HTML saved successfully.")
    print("File: raaka_page.html")

    input("\nPress Enter to close Chrome...")

finally:
    driver.quit()