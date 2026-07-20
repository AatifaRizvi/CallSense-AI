import pandas as pd

# Load CSVs
en = pd.read_csv('data/processed/english_reviews_1500.csv')
hi = pd.read_csv('data/processed/hindi_reviews_900.csv')
hg = pd.read_csv('data/processed/hinglish_reviews_150.csv')

# Normalize English
en_clean = pd.DataFrame({
    'review_id':   en['review_id'],
    'language':    'English',
    'review_text': en['review_text'],
    'title':       en.get('title', pd.Series([''] * len(en))),
    'rating':      en['rating'],
    'sentiment':   en['sentiment'],
    'category':    en.get('category', pd.Series(['General'] * len(en))),
    'designation': en.get('designation', pd.Series([None] * len(en))),
    'company':     en.get('company', pd.Series([None] * len(en))),
    'date':        en.get('date', pd.Series([None] * len(en))),
    'source':      en.get('source', pd.Series([None] * len(en))),
})

# Normalize Hindi
hi_clean = pd.DataFrame({
    'review_id':   hi['review_id'],
    'language':    'Hindi',
    'review_text': hi['review_text'],
    'title':       hi.get('title', pd.Series([''] * len(hi))),
    'rating':      hi['rating'],
    'sentiment':   hi['sentiment'],
    'category':    hi.get('category', pd.Series(['General'] * len(hi))),
    'designation': hi.get('designation', pd.Series([None] * len(hi))),
    'company':     hi.get('company', pd.Series([None] * len(hi))),
    'date':        hi.get('date', pd.Series([None] * len(hi))),
    'source':      pd.Series(['real'] * len(hi)),
})

# Normalize Hinglish
hg_clean = pd.DataFrame({
    'review_id':   hg['Review ID'],
    'language':    'Hinglish',
    'review_text': hg['Review Text'],
    'title':       pd.Series([''] * len(hg)),
    'rating':      hg['Rating (1-5)'],
    'sentiment':   hg['Sentiment'],
    'category':    hg['Category'],
    'designation': hg['Designation'],
    'company':     hg['Company'],
    'date':        hg['Date'],
    'source':      pd.Series(['generated'] * len(hg)),
})

# Merge
master = pd.concat([en_clean, hi_clean, hg_clean], ignore_index=True)

master.insert(0, 'master_id', ['MR-' + str(1000 + i) for i in range(len(master))])
master = master.drop(columns=['review_id'])

master['sentiment'] = master['sentiment'].str.strip().str.capitalize()

print(f"Total rows     : {len(master)}")
print(f"\nLanguage dist  :\n{master['language'].value_counts()}")
print(f"\nSentiment dist :\n{master['sentiment'].value_counts()}")
print(f"\nRating dist    :\n{master['rating'].value_counts().sort_index()}")
print(f"\nColumns        : {master.columns.tolist()}")

# Save
master.to_csv('data/processed/master_reviews.csv', index=False)
print("\n Saved: master_reviews.csv")