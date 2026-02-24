import streamlit as st
from career_gps.model import CareerPathModel
from datetime import datetime


st.set_page_config(page_title="Career GPS", page_icon="🚀", layout="wide")
st.title("🚀 Career GPS")
st.subheader("Your AI Career Navigation System")

col1, col2 = st.columns([1, 2])


if "roadmap" not in st.session_state:
    st.session_state.roadmap = None
if "error" not in st.session_state:
    st.session_state.error = None

with col1:
    skills_input = st.text_area("Your Current Skills", 
                                placeholder="Python, SQL, React, AWS, Leadership...",
                                height=150)
    model_choice = st.selectbox("Model", 
                                ["grok-4-1-fast-reasoning", "grok-4"],
                                index=0)

with col2:
    job_desc = st.text_area("Target Job Description", 
                            placeholder="Paste the full job posting here...",
                            height=300)

if st.button("Generate My Career Roadmap", type="primary", use_container_width=True):
    if not skills_input or not job_desc:
        st.error("Please fill both fields")
    else:
        with st.spinner("Grok is charting your career path..."):
            skills = [s.strip() for s in skills_input.split(",")]
            model = CareerPathModel(model=model_choice)
            roadmap = model.generate(skills, job_desc)
            
            st.success("✅ Your personalized roadmap is ready!")
            st.markdown(roadmap)
            
            # Download button
            st.download_button(
                label="📥 Download as Markdown",
                data=roadmap,
                file_name=f"CareerGPS_{datetime.now().strftime('%Y%m%d')}.md",
                mime="text/markdown"
            )