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

    print("Waiting for page to load...")
    time.sleep(8)

    print("\n========== PAGE TEXT ==========\n")

    page_text = driver.find_element("tag name", "body").text

    print(page_text)

    print("\n========== END PAGE TEXT ==========\n")

    input("Press Enter to close Chrome...")

finally:
    driver.quit()