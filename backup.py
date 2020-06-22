# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
from IPython import get_ipython


# %%
# Check if project packages are installed
get_ipython().system(' pip show selenium webdriver-manager pandas beautifulsoup4 py2neo')


# %%
# install packages if not already installed
get_ipython().system(' pip install selenium webdriver-manager pandas beautifulsoup4 py2neo')


# %%
# Import packages
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager 
from bs4 import BeautifulSoup
import pandas as pd
import re
from py2neo import Graph, Node, Relationship, NodeMatcher, RelationshipMatcher


# %%
#URL constants
GOV_UK_HOME_URL = "https://www.gov.uk"
DOCUMENTS_URL = "https://www.gov.uk/guidance/immigration-rules"
POINT_BASED_SYSTEM_URL = "https://www.gov.uk/guidance/immigration-rules/immigration-rules-part-6a-the-points-based-system"


# %%
# Establish database connection

graph = Graph('bolt://localhost:7687', auth=('neo4j', 'Undertaker11.'))


# %%
matcher = NodeMatcher(graph)


# %%
#Open documents url for scraping
driver = webdriver.Chrome(ChromeDriverManager().install())
driver.get(DOCUMENTS_URL)

content = driver.page_source
soup = BeautifulSoup(content)

driver.close()


# %%
"""Creating Immigration Document Nodes"""
docs = soup.find(attrs={'class': 'section-list'})
for doc_list_item in docs.findAll('li'):
    title = doc_list_item.a.find('span', attrs={
        'class': 'subsection-title-text'}
        ).text
    summary = doc_list_item.a.find('span', attrs={
        'class': 'subsection-summary'}
        ).text
    url = GOV_UK_HOME_URL + doc_list_item.a['href']
    
    tx = graph.begin()
    tx.evaluate('''
        CREATE (doc:Document {
            title: $title, summary: $summary, url: $url
            })
        ''', parameters = {'title': title, 'summary':summary, 'url': url})
    tx.commit()


# %%
# TODO: 
# Query graph for urls of all documents
# Loop through urls
# For each url, open page for scraping
# Create section nodes connected to each doc like already done with the Point Based System doc


# %%
docs = list(matcher.match("Document").skip(1))

for doc in docs:
    driver = webdriver.Chrome(ChromeDriverManager().install())
    driver.get(doc['url'])

    content = driver.page_source
    soup = BeautifulSoup(content)

    driver.close()

    for section in soup.findAll(attrs={'class': 'js-subsection-title'}):
        tx = graph.begin()
        tx.evaluate('''
            CREATE (sec:Section {title: $title})
            ''', parameters = {'title': section.text})
        tx.evaluate('''
            MATCH (doc:Document), (sec:Section) 
            WHERE sec.title = $title AND doc.title = $doc_title
            CREATE (doc)-[: CONTAINS]->(sec)
            ''', parameters = {'title': section.text, 'doc_title': doc['title']})
        tx.commit()


# %%
docs[15]


# %%
#Get points based system immigration rules(part 6a) web page
driver = webdriver.Chrome(ChromeDriverManager().install())
driver.get(POINT_BASED_SYSTEM_URL)

content = driver.page_source
soup = BeautifulSoup(content)

driver.close()


# %%
"""Creating Section Nodes and connecting to the Point Based System Part 6a Document Node"""
for section in soup.findAll(attrs={'class': 'js-subsection-title'}):
    tx = graph.begin()
    tx.evaluate('''
        CREATE (sec:Section {title: $title})
        ''', parameters = {'title': section.text})
    tx.evaluate('''
        MATCH (doc:Document), (sec:Section) 
        WHERE sec.title = $title AND doc.title = "Immigration Rules part 6A: the points-based system"
        CREATE (doc)-[: CONTAINS]->(sec)
        ''', parameters = {'title': section.text})
    tx.commit()


# %%
"""Creating Paragraph Nodes for Paragraphs under the Sections of the Point Based System Part 6a Document"""
for section in soup.findAll(attrs={'class': 'js-openable'}):
    for tag in section.div.contents: # Loop through tags in section
        if(tag.name == 'h3' and tag.text != 'Notes'): # If it is an h3 tag and the tag's text is not Notes
            par_title_parts = tag.text.split('.')
            title = par_title_parts[-1].strip()
            number = par_title_parts[0]

            tx = graph.begin()
            tx.evaluate('''
                CREATE (par:Paragraph {title: $title, number: $number})
                ''', parameters = {'title': title, 'number': number})
            tx.evaluate('''
                MATCH (sec:Section), (par:Paragraph) 
                WHERE sec.title = $sec_title AND par.number = $number
                CREATE (sec)-[: CONTAINS]->(par) 
                ''', parameters = {'sec_title': section.h2.text, 'number': number})
            tx.commit()

