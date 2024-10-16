import spacy
from dateparser import parse as dateparse
from sentence_transformers import SentenceTransformer, util

# Model initialization
nlp = spacy.load('en_core_web_sm')
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')


# Get entities from text
def extract_entities(text: str):
    doc = nlp(text)
    entities = {'PERSON': [], 'GPE': [], 'DATE': [], 'MONEY': [], 'PERCENT': [], 'CARDINAL': [], 'ORG': []}
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text)
    return entities


# Calculate semantic similarity between two texts
def calculate_semantic_similarity(text1: str, text2: str) -> float:
    embeddings1 = sbert_model.encode(text1, convert_to_tensor=True)
    embeddings2 = sbert_model.encode(text2, convert_to_tensor=True)
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    return cosine_scores.item()


# Analyze date from text
def parse_date(text: str):
    doc = nlp(text)
    dates = []
    for ent in doc.ents:
        if ent.label_ == 'DATE':
            dates.append(ent.text)
    return dates


# Evaluate news articles
def evaluate_news(original_query: str, news_articles: dict):
    original_entities = extract_entities(original_query)
    original_dates = parse_date(original_query)

    similarities = []
    time_consistencies = []
    location_consistencies = []
    numeric_consistencies = []

    for idx, article in news_articles.items():
        title = article.get('title', '') or ''
        description = article.get('description', '') or ''
        content = title + ' ' + description

        article_entities = extract_entities(content)
        similarity = calculate_semantic_similarity(original_query, content)
        similarities.append(similarity)

        # Time consistency
        article_dates = parse_date(content)
        time_consistency = False
        for od in original_dates:
            for ad in article_dates:
                try:
                    od_parsed = dateparse(od)
                    ad_parsed = dateparse(ad)
                    if od_parsed and ad_parsed and abs((od_parsed - ad_parsed).days) <= 7:
                        time_consistency = True
                        break
                except Exception:
                    continue
        time_consistencies.append(time_consistency)

        # Location consistency
        original_locations = set(original_entities['GPE'])
        article_locations = set(article_entities['GPE'])
        location_consistency = not original_locations.isdisjoint(article_locations)
        location_consistencies.append(location_consistency)

        # Numeric consistency
        original_numbers = set(
            original_entities['CARDINAL'] + original_entities['PERCENT'] + original_entities['MONEY'])
        article_numbers = set(article_entities['CARDINAL'] + article_entities['PERCENT'] + article_entities['MONEY'])
        numeric_consistency = not original_numbers.isdisjoint(article_numbers)
        numeric_consistencies.append(numeric_consistency)

    # Calculate average similarity and consistency ratios
    avg_similarity = sum(similarities) / len(similarities) if similarities else 0
    time_match_ratio = sum(time_consistencies) / len(time_consistencies) if time_consistencies else 0
    location_match_ratio = sum(location_consistencies) / len(location_consistencies) if location_consistencies else 0
    numeric_match_ratio = sum(numeric_consistencies) / len(numeric_consistencies) if numeric_consistencies else 0

    # Calculate overall fake news probability
    overall_score = (
            avg_similarity * 0.60 +
            time_match_ratio * 0.20 +
            location_match_ratio * 0.10 +
            numeric_match_ratio * 0.10
    )
    fake_news_probability = max(0, min((1 - overall_score) * 100, 100))

    # Define the label based on the score
    def get_score_label(score):
        if score <= 0.33:
            return "low"
        elif score <= 0.66:
            return "moderate"
        else:
            return "high"

    # Formatting the reason in a compact structure
    reason = (
        f"• The average semantic similarity is <strong>{avg_similarity:.2f}</strong> ({get_score_label(avg_similarity)}).<br>"
        f"• Time consistency is <strong>{get_score_label(time_match_ratio)}</strong>, score {time_match_ratio:.2f}.<br>"
        f"• Location consistency is <strong>{get_score_label(location_match_ratio)}</strong>, score {location_match_ratio:.2f}.<br>"
        f"• Numeric consistency is <strong>{get_score_label(numeric_match_ratio)}</strong>, score {numeric_match_ratio:.2f}.<br>"
        f"<br>Based on these factors, the input news has a probability of <strong>{round(fake_news_probability, 2)}%</strong> to be fake."
    )

    return {
        "probability": round(fake_news_probability, 2),
        "reason": reason
    }


