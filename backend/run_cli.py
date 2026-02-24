import argparse
from datetime import datetime
from rich.console import Console
from rich.markdown import Markdown
from career_gps.model import CareerPathModel

console = Console()

def main():
    parser = argparse.ArgumentParser(description="🚀 Career GPS - AI Career Path Generator")
    parser.add_argument("--skills", type=str, required=True, help="Comma-separated skills (e.g. Python,SQL,React)")
    parser.add_argument("--job", type=str, required=True, help="Job description (or path to .txt file)")
    parser.add_argument("--model", default="gemini-2.5-flash", 
                        help="Gemini model: gemini-2.5-flash (fast & free, recommended), gemini-2.5-pro (best quality), gemini-2.5-flash-lite (cheapest)")
    parser.add_argument("--save", action="store_true", help="Save roadmap to outputs/ folder")

    args = parser.parse_args()

    # Load job description
    if args.job.endswith(".txt"):
        with open(args.job, "r", encoding="utf-8") as f:
            job_desc = f.read()
    else:
        job_desc = args.job

    skills = [s.strip() for s in args.skills.split(",")]

    console.print("[bold cyan]🚀 Generating your Career GPS Roadmap...[/bold cyan]\n")
    
    model = CareerPathModel(model=args.model)
    roadmap = model.generate(skills, job_desc)

    console.print(Markdown(roadmap))

    if args.save:
        filename = f"outputs/CareerGPS_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(filename, "w", encoding="utf-8") as f:
            f.write(roadmap)
        console.print(f"\n[green]✅ Roadmap saved as {filename}[/green]")

if __name__ == "__main__":
    main()