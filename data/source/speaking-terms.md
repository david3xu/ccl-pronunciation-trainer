# Speaking Terms - Clean Version

## 1. Introducing Myself

Hi, I'm Jinguo Xu.
I go by David.
I work in AI and Data Science.
My background includes
A Master's in Data Science from Curtin
A Master's in Economics
A Bachelor's in Mathematics
This mix helps me understand both technical details
and business value of AI systems.

## 2. My Career Path

### Banking Background (2010-2022)

I started my career in banking.
For over ten years,
I analyzed data and managed investments.
First, at Bank of Tangshan,
I progressed through several roles.
I started as a Loan Compliance Analyst,
then became a Loan Officer,
then Investment Manager,
and finally was promoted to Director in 2014.
This showed my ability to grow in responsibility.
Then, at Bank of Changsha,
I worked as an Investment Manager
from 2017 to 2022.
There I focused on asset securitization
and fixed-income market investments.
These banking roles taught me two important skills:
First, how to analyze data carefully.
Second, how to understand what business users actually need.
In AI development,
these skills are very valuable.
When I build systems now,
I focus not just on technical features
but on making sure people will actually use them.

### Moving to AI (2021-2023)

In 2021,
I decided to change my career.
I studied Data Science at Curtin University.
I learned Python, Java, data mining, and machine learning.
I also worked on a transport data project
using SQL and mapping tools.
This was my foundation
before moving into AI work.

### CIRA - My First AI Project (2023-2024)

My first real AI job was at CIRA
that's the Curtin Institute of Radio Astronomy.
I built a simple AI chat system
for astronomy researchers.
This was my introduction to
Basic language models
Simple information retrieval
Working with researchers
This was a learning project.
I was just beginning to understand
how AI systems work.

### UWA - More Advanced Work (2025)

At UWA,
I moved to more advanced AI work.
During six months there, I
Built three research prototypes
Used PydanticAI for multi-agent systems
Created Neo4j graph databases
Worked with Azure cloud services
Processed over 7,300 records from mining data
This project was much more complex.
I made 315 commits on GitHub
and trained four research students on the system.

## 3. The Azure Universal RAG Project

### Why This Project Matters for Your Role

Now let me tell you about my main UWA project.
This project is very relevant to your research mapping tool
because it solved similar challenges.
As this project evolved,
we made five key improvements
that directly relate to what you need
First, data flexibility:
It started handling only mining data
but grew to process any content type
just like your system will need to handle different research documents.
Second, specialized components:
We created multiple agents working together
which is exactly the approach needed for complex research mapping.
Third, relationship mapping:
We built a system to find connections between different entities
the core function of your research relationships tool.
Fourth, researcher-focused design:
We made it specifically for non-technical users
crucial for adoption by your research teams.
Finally, rapid development:
We built it on a tight timeline
just like your 4-month prototype needs.

### How It Started - Phase 1 (July 12-15, 2025)

Let me walk you through how this system evolved.
We started with a system called 'MaintIE'
which stands for Maintenance Information Extraction.
The first version had a major limitation:
it could only work with maintenance reports.
Why?
Because it used a fixed schema with almost 4,000 lines of predefined rules.
This created a problem:
whenever we wanted to process a different type of document,
we would need to write completely new rules.
The system was too specific and couldn't adapt.

### Getting Better - Phase 2 (July 16-19, 2025)

We quickly realized
we needed a more flexible solution.
Our goal was to process any type of document,
not just maintenance data.
So what did we do?
We replaced the fixed rules
with dynamic templates.
These templates could automatically adjust
based on the content they encountered.
This was our solution for adaptability.
Surprisingly,
this major improvement happened very quickly
just a few days of work
between July 16th and 19th.
The business impact was immediate:
our system could now handle any document type.
Why am I telling you this?
Because it's directly relevant to your research mapping project.
Your system will need to process many different formats
research papers, grant applications, clinical protocols
and this flexible approach would work perfectly for that challenge.

### Multi-Agent Design - Phase 3 (August 7-8, 2025)

As our system grew more capable,
we encountered a new problem.
One single process trying to do everything
was becoming inefficient and hard to improve.
We needed a new architecture.
The solution?
We split the system into three specialized agents
The first agent analyzes content structure
like understanding what type of document it is
The second agent finds entities and their relationships
like identifying researchers and their projects
The third agent handles complex searches
like answering questions about connections
Think of it like this:
instead of having one person trying to do everything,
we created a team of specialists
where each member focuses on what they do best.
How does this apply to your project?
Your research mapping tool will need to perform similar tasks:
extract researcher information,
map project connections,
and answer complex questions.
This multi-agent approach would give you better results
in each of those areas.

### Better Search - Phase 4 (August 14-20, 2025)

The next challenge we faced was about search capability.
We made an important discovery:
simple keyword search wasn't enough
to find complex relationships in our data.
Let me explain the problem:
When users asked questions like "Show me all related components and their failures,"
keyword search would miss many important connections.
Why?
Because relationships exist beyond just matching words.
To solve this,
we developed what we called "tri-modal search"
combining three different approaches
First, vector search
which finds similar content
even when words don't match exactly
Second, graph search
which follows direct relationships
like "researcher works on project"
Third, neural network search
which discovers hidden patterns
across the entire database
The result was remarkable.
This combined approach could answer complex questions
that none of the individual methods could handle alone.
For your research mapping project,
this approach would be extremely valuable.
You'll need to find many types of connections
between researchers, projects, and themes
some obvious and direct,
others more subtle and indirect.
This tri-modal approach would capture all of these relationships.

### Automation - Phase 5 (August 15-21, 2025)

The final challenge we addressed was practicality.
A system with great features isn't useful
if it's too complicated or slow to operate.
Our initial process had a major problem:
it required over 30 manual steps
to process a batch of documents.
This created two issues:
First, it was very time-consuming, taking hours.
Second, it was prone to human error.
Our solution was automation.
We built a streamlined pipeline with 6 main phases
Data collection
Processing and cleaning
Analysis
Entity extraction
Relationship mapping
Search preparation
The impact was dramatic:
processing time dropped from hours to just 15 minutes.
And the system became much more reliable.
For your 4-month prototype,
I would recommend building in automation from the beginning.
This would let you demonstrate the system with real data
and make updates quickly
as you gather feedback from researchers.

## 4. What I Achieved Technically

### Multi-Agent System

The technical heart of the project
was three specialized agents working together
Each agent had a specific role
They communicated through structured data
Each one produced specific outputs
This modular design
made the system flexible and maintainable.

### Knowledge Graph

For relationship mapping,
I designed a graph database in Neo4j
12 different types of entities
Clear relationships between them
Over 7,300 records processed
Natural language interface for questions

### Cloud Architecture

The system ran on Azure cloud services
9 different Azure services
Automated deployment
6-phase data pipeline
Real-time progress tracking
This made the system reliable
and easy to scale.

### Real Performance

The system performed well with real data
Processed each document in 35-47 seconds
88.4% accuracy in finding entities
Handled 179 files in 15 minutes
Saved hours of manual work

## 5. My CIRA Experience

Let me briefly compare this
to my earlier work at CIRA

### Basic AI Work

Used existing language models (no customization)
Built simple search functionality
Created basic conversational interfaces
Focused on learning the fundamentals

### What I Learned

The most important lesson was about user focus
Researchers care about usability more than technical sophistication
Simple tools that work are better than complex tools nobody uses
Getting feedback early and often is essential
This experience taught me how to work with researchers
and build tools they'll actually use.

## 6. Why I'm Right for Kids Research Institute

My experience matches your needs in three key ways

### Technical Match

I've built PydanticAI systems - exactly what you're looking for
I've designed graph databases for relationship mapping
I've deployed systems on Azure cloud services

### Research Experience

I've worked in two research institutions
I've built systems researchers actually use
I've delivered prototypes on tight timelines

### Mission Alignment

Children's health research creates real-world impact
I understand my role is focused on mapping tools
I can support your lab's broader vision

## 7. Technical Growth Journey

To wrap up,
I'd like to highlight what I think is most relevant for your role:
my rapid technical growth over the past two years.
My journey shows clear progression in four key areas
Architecture:
I started with basic conversational interfaces at CIRA,
then advanced to sophisticated multi-agent systems at UWA.
This growth in systems thinking would be valuable for designing your research mapping tool.
Data Processing:
I began with simple document retrieval,
but developed skills to handle complex data processing pipelines.
Your project will require similar data processing capabilities.
Search Intelligence:
My skills evolved from basic keyword search
to advanced tri-modal approaches combining multiple technologies.
This is exactly the kind of intelligence needed to find research connections.
Project Scale:
I progressed from small learning projects
to production-ready systems handling thousands of records.
This shows I can deliver at the scale you need.
What does this pattern demonstrate?
It shows I can learn quickly
and adapt to increasing complexity.
For your 4-month prototype,
you need someone who can ramp up rapidly
and deliver results in a tight timeframe.
My track record shows I can do exactly that.