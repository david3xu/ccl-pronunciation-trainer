# Topic Terms - Clean Version

## 1. PydanticAI Experience

### What is PydanticAI

PydanticAI is a framework
that helps build AI systems
with multiple specialized parts called agents.
It was released in late 2024.

The main benefit is addressing Python's dynamic typing challenge.
Python normally doesn't check data types until runtime,
which can cause unexpected errors.
PydanticAI adds strict type checking
to make sure data between agents
has exactly the right structure and format.

Think of it like this:
In regular Python,
you might pass the wrong data type
and only discover the error when the program crashes.
PydanticAI prevents this
by providing a strict contract
between different AI components.

PydanticAI is actually an evolution
of the popular Pydantic library.
Pydantic itself is widely used for data validation
in many Python applications.
PydanticAI extends this
specifically for AI agent communication.

### My Experience with PydanticAI

At UWA,
I used PydanticAI to build a multi-agent system.
This system processed mining maintenance data
using three specialized agents.

What makes PydanticAI powerful
is how it structures data between agents.
I used it to create clear interfaces
with specific input and output models.
This ensured reliable communication
between the different components.

For example,
our Knowledge Extraction Agent
took unstructured text as input
and produced structured data with entities and relationships.
The output was strictly typed
using PydanticAI models
with validation built in.

The timing is interesting:
PydanticAI was just emerging when I worked with it.
It was released in late 2024,
and I used it in early 2025.
This means I've already worked through the learning curve
that many developers are still facing.

### Practical Example

One challenge we faced was inconsistent data formats
from different mining facilities.

With PydanticAI,
I created a validation layer
that automatically converted and normalized formats.
When data didn't match our models,
the system would flag it
and apply appropriate transformations.

The business impact?
Data processing time dropped from hours to minutes
and error rates decreased significantly.

## 2. Research Mapping Approach

### My Three-Phase Approach

For mapping research activities,
I would take a three-phase approach.

Phase 1 would be data discovery.
I'd identify all the data sources first:
research papers, grant applications,
project documentation, and collaboration records.
I would meet with research teams
to understand their workflow
and how they currently track projects.

Phase 2 would be building the mapping system.
I'd create specialized PydanticAI agents
for different document types.
One agent might process research papers,
another might handle grant applications.
The key is creating a consistent knowledge structure
across different document types.

Phase 3 would be the interface and visualization.
I'd build a simple web interface
using Streamlit.
It would have natural language query capabilities
and interactive visualizations
of research relationships.

For the 4-month timeline,
I'd focus on delivering a working prototype
that handles the most important document types first.
We could then expand to more sources
in future iterations.

### Practical Example

A practical approach I've used before
is starting with a small, focused proof-of-concept.
At UWA,
I began by processing just one document type
to validate the approach.

For your project,
I might start with research project summaries
as they contain the core information.
Within two weeks,
I could demonstrate a basic system
that extracts project names, researchers, and themes.
This would give us quick feedback
and validate our approach
before expanding to other document types.

## 3. Multi-Agent System Design

### What are Multi-Agent Systems

A multi-agent system
is an AI approach
where we divide complex tasks
into smaller parts
handled by specialized components called agents.

Instead of one big system
trying to do everything,
we create multiple smaller agents.
Each agent focuses on a specific task
it's good at.
The agents work together,
sharing information
to solve complex problems.

It's like a team of specialists
working together.
Rather than one person
trying to do everything,
you have experts
who each handle their specialty
and collaborate.

### My Design Approach

For designing a multi-agent system
to map research activities,
I would create four specialized agents:

First, the Document Processing Agent.
This agent would handle different document formats:
PDFs, Word documents, web pages, databases.
It would extract text and structure
and prepare it for analysis.

Second, the Entity Recognition Agent.
This agent would identify key elements:
researcher names, project titles, research themes,
methodologies, and timelines.
It would use NER techniques
customized for research terminology.

Third, the Relationship Mapping Agent.
This agent would discover connections:
who works with whom,
which projects share themes,
how research areas overlap.
It would build the knowledge graph
that powers your visualization.

Fourth, the Query Interface Agent.
This agent would translate natural language questions
into database queries.
It would allow non-technical users
to explore the research landscape
through conversation.

The agents would communicate
through well-defined interfaces
using PydanticAI models.
Each agent would have specific inputs and outputs
that ensure reliable data flow.

### Practical Example

When a new research paper is published,
the Document Processing Agent would extract the text.
It would identify it's a research paper
and apply the appropriate extraction pattern.

Next, the Entity Recognition Agent would identify
Dr. Smith as the lead researcher,
'pediatric genomics' as the theme,
and 'machine learning for rare disease identification' as the methodology.

The Relationship Mapping Agent would then discover
that Dr. Smith has collaborated with Dr. Chen
on three previous projects,
all in genomics but using different methods.
It would add these connections to the knowledge graph.

Finally, when a research director asks,
'What machine learning projects are happening in genomics?'
the Query Interface Agent would translate this
to a database query
that returns all relevant projects,
including the new paper.

## 4. Graph Databases for Relationship Mapping

### What are Graph Databases

A graph database
is a special type of database
designed to store connections
between different things.
Unlike regular databases
that store data in tables,
graph databases focus on relationships.

In a graph database,
we store 'nodes' (which represent things)
and 'relationships' (which connect nodes).
For example,
a researcher would be a node,
a project would be a node,
and 'works on' would be a relationship
connecting them.

The main advantage
is that graph databases
make it very fast and easy
to answer questions about connections.
Questions like 'Who works with whom?'
or 'Which projects are related to this theme?'
are much simpler to answer
than in traditional databases.

### Why Graph Databases Work for Research Mapping

For mapping research relationships,
graph databases are the perfect tool.
At UWA,
I designed a Neo4j database
with a 12-entity schema
specifically for relationship mapping.

Traditional databases store data in tables,
which makes relationship queries complex and slow.
Graph databases, however,
store relationships as first-class citizens,
making connection queries extremely fast and intuitive.

For a research mapping system,
I would design a schema with entities like:
Researchers, Projects, Publications, Grants,
Research Themes, Methodologies, and Outcomes.
The relationships between these entities
would capture the full research ecosystem.

With this structure,
you could answer complex questions like:
'Which researchers work across multiple themes?'
or 'What methodologies are being used
across different research areas?'
These insights would help identify
collaboration opportunities
and research gaps.

### Practical Example

At UWA,
we needed to identify
potential points of failure
in mining equipment.
By modeling equipment components as nodes
and their interactions as relationships,
we could quickly trace failure patterns.

When a pump failed,
the graph database could instantly show
all related components,
past maintenance issues,
and similar failures across facilities.
This allowed engineers
to predict cascade failures
before they happened.

For your research mapping,
this same approach would reveal
unexpected connections between research areas
and identify potential collaborations
that might otherwise remain hidden.

## 5. Researcher-Friendly Interface Design

### Key Principles

Creating interfaces that researchers actually use
is critical for adoption.
Based on my experience
at both CIRA and UWA,
I've learned several key principles.

First, simplicity over sophistication.
Researchers want quick answers
to specific questions.
I would design a clean interface
with a prominent search bar
for natural language queries.
No complex navigation or technical jargon.

Second, visual relationship mapping.
I would create interactive visualizations
showing research connections.
Researchers could explore
by clicking on nodes and relationships,
seeing how their work connects
to other projects and themes.

Third, personalized dashboards.
Each researcher would have
a personalized view
showing their projects, collaborators,
and relevant institutional activities.
This creates immediate personal value.

Fourth, incremental complexity.
The interface would have simple functions
that everyone uses,
with advanced features
available but not obtrusive.
This allows growth as users become comfortable.

### Practical Example

At CIRA,
I learned an important lesson
about researcher interfaces.
Initially, I built a powerful system
with many advanced features.
But researchers rarely used it.
Why? It was too complicated.

I redesigned it
with a simple natural language interface.
Researchers could type questions
like 'Show me recent papers on radio astronomy'
and get immediate results.
Usage increased dramatically.

For your mapping tool,
I would take the same approach.
A researcher should be able to ask,
'What other teams are working on genomics?'
and immediately see a visual map
of related projects and people.
No training required,
just intuitive interaction.

## 6. Meeting the 4-Month Prototype Timeline

### My Phased Approach

Delivering a working prototype in 4 months
requires careful planning and prioritization.
Based on my experience at UWA,
where I delivered three prototypes in 6 months,
I would take a phased approach.

Month 1: Discover and Plan.
I would audit data sources,
interview key stakeholders,
and design the basic architecture.
By the end of Month 1,
we would have a simple proof-of-concept
extracting data from one document type.

Month 2: Core Functionality.
I would build the basic agent system,
implement the graph database,
and create simple data pipelines.
By month's end,
we would have a system mapping
at least 50 research projects.

Month 3: Interface and Queries.
I would develop the natural language interface,
create basic visualizations,
and implement the most important queries.
Researchers could start testing
with real questions.

Month 4: Polish and Scale.
I would refine based on feedback,
improve visualizations,
add more document types,
and prepare for the leadership demonstration.
The final prototype would map
at least 75% of selected teams' projects.

What makes me confident in this timeline?
At UWA, I delivered a more complex system
in approximately 6 weeks.
I committed over 315 changes to GitHub
during that period.
I understand how to balance
perfect versus good enough
to meet tight deadlines.

### Practical Example

At UWA,
we needed to deliver a multi-agent system
with a full Neo4j database
in less than two months.
I broke this down into weekly milestones
with clear deliverables.

Week 1: Basic agent structure and database schema
Week 2: Single agent processing a sample dataset
Week 3: Multiple agents with basic coordination
Week 4: Full database implementation with test data
Week 5: Query interface and basic visualization
Week 6: Production data processing and refinement

By focusing on incremental functionality
and daily progress,
we delivered on time.
I would bring this same disciplined approach
to your 4-month timeline.

## 7. Integration with Research Reimagined Strategy

### Understanding the Strategy

The Research Reimagined strategy
appears to be
Kids Research Institute's initiative
to transform how research is conducted
using advanced technologies and collaboration.

From what I understand,
the strategy focuses on:
1. Breaking down silos
between research teams
2. Using AI and computational approaches
to accelerate discovery
3. Making research knowledge
more accessible and connectable
4. Building advanced capabilities
like autonomous discovery systems

My understanding is that
this mapping system project
is part of the foundation
for this broader strategy.
It aims to create
the basic infrastructure
that will enable
more advanced research approaches.

### How My System Supports This

I've researched your Research Reimagined strategy,
and I see how this mapping system
fits into that broader vision.

First, breaking down research silos.
Your strategy emphasizes
cross-team collaboration.
This mapping system will make
research activities visible across teams,
helping researchers discover
potential collaborations.

Second, accelerating discovery.
By making institutional knowledge
more accessible,
researchers can build on existing work
instead of duplicating efforts.
This speeds up the research cycle.

Third, supporting computational biology.
I noticed you're also recruiting
postdoctoral researchers
for autonomous discovery systems.
The mapping system I would build
could provide the foundational knowledge base
that these discovery systems query.

Fourth, maximizing research impact.
When researchers can see
the full landscape of institutional activities,
they can identify strategic opportunities
to differentiate their work
or combine complementary approaches.

### Practical Example

Here's a concrete example
of how the mapping system
would support your strategy.

Imagine a researcher
starting a new project on
pediatric autoimmune conditions.
Using the mapping system,
they discover three teams
working on related topics:
one on genomic markers,
one on treatment protocols,
and one on patient monitoring.

Without this system,
these connections might remain hidden.
With it,
the researcher can reach out
to these teams,
potentially forming a collaborative group
with complementary expertise.
This directly supports
your goal of breaking down silos
and accelerating discovery.

## 8. Experience Working with Researchers

### My Background

I have experience working directly with researchers
at both CIRA and UWA.
This has taught me
how to build systems
that meet their unique needs.

At CIRA,
I worked with astronomy researchers
who needed to query complex datasets.
I learned that researchers have specific workflows
and limited time to learn new tools.
Systems need to integrate
with their existing processes
and provide immediate value.

At UWA,
I worked with mining researchers
analyzing maintenance data.
I observed how they approach problems
and what information they find valuable.
I built my system
to match their mental models.

### Key Insights

The key insights I've gained are:

First, researchers care about content, not technology.
They want answers, not complex interfaces.
I focus on making technology invisible.

Second, research workflows vary widely.
Systems need to be flexible
to accommodate different approaches.
One-size-fits-all doesn't work.

Third, researchers need to trust the system.
This means showing sources,
explaining reasoning,
and being transparent about limitations.
No black boxes.

### Practical Example

At UWA,
when developing the mining analysis system,
I noticed researchers would print reports
and mark them up by hand.
Rather than forcing them
to change their workflow,
I built a feature
that generated PDF summaries
formatted the way they preferred.

This small accommodation
dramatically increased adoption.
For your mapping system,
I would observe how researchers
currently track and discover projects,
then design interfaces
that enhance rather than replace
their existing methods.

## 9. Handling Unstructured Research Data

### The Challenge

Research data presents unique challenges
because it comes in many formats
and varies in structure and quality.
Unstructured data
refers to information
that doesn't have a predefined format
or organization.
It's messy, inconsistent,
and doesn't fit neatly into rows and columns.

In research environments,
unstructured data is common.
Think of research papers
with different formats,
emails discussing projects,
meeting notes,
or even handwritten documents.
Each source has valuable information,
but it's not organized consistently.

The challenge is
extracting meaning from this mess.
We need to identify
important entities, relationships, and concepts
hidden in the unstructured text.
This requires specialized processing
to transform unstructured data
into structured information
that computers can easily analyze.

### My Approach

My approach to handling this complexity
has several components.

First, flexible ingestion pipelines.
I would build agents
that can process different document types:
PDFs, Word documents, web pages, databases,
and even email communications.
Each would have specialized extraction patterns.

Second, entity normalization.
Research often refers to the same entities
in different ways.
'Dr. J. Smith' and 'Jane Smith, PhD'
might be the same person.
I would implement entity resolution
to create a consistent knowledge graph.

Third, confidence scoring.
Not all extracted information
is equally reliable.
I would implement confidence scores
for extracted entities and relationships,
allowing users to filter by reliability.

Fourth, human-in-the-loop verification.
For critical connections,
I would design feedback mechanisms
where researchers can verify or correct
automatically extracted relationships.

### Practical Example

At UWA,
I faced a similar challenge
with maintenance reports.
They came from four different facilities
using different formats and terminology.

I built a processing pipeline
with specialized extractors for each format,
then normalized the extracted entities
using a common vocabulary.
The system would recognize
that 'pump failure' and 'P-sys malfunction'
referred to the same issue type.

For research mapping,
I would apply this same approach
to handle variations in how projects,
methodologies, and themes
are described across different documents.

## 10. Collaboration with Technical and Non-Technical Stakeholders

### My Approach

Building a successful research mapping system
requires effective collaboration
with both technical and non-technical stakeholders.
I have experience with both groups.

For technical collaboration,
I work with clear specifications,
shared architectural understanding,
and regular code reviews.
At UWA,
I worked closely with the data science team,
using Git for collaboration
and CI/CD for quality assurance.
I'm comfortable in technical discussions,
using appropriate terminology
and focusing on implementation details.

For non-technical collaboration,
I adapt my communication style.
I focus on outcomes rather than technology,
use visual aids to explain concepts,
and listen carefully to understand needs.
At CIRA,
I worked directly with astronomers,
translating their research questions
into system requirements.
I never assume technical knowledge,
but I also don't oversimplify
to the point of inaccuracy.

In both cases,
I maintain regular communication cycles,
demonstrate progress early and often,
and seek feedback continuously.
This builds trust
and ensures the final system
meets everyone's needs.

### Practical Example

Here's a practical example
of how I would apply this
to your project.

With Dr. Lassmann and the computational biology team,
I would collaborate through technical specifications,
architecture discussions,
and regular code reviews.
We might discuss
the optimal graph schema design
or agent communication protocols.

With research theme leaders,
I would focus on use cases and outcomes.
We might use mockups and simple demos
to gather feedback on interface design
and query capabilities.
I would ask questions like,
'What information would help you discover
new collaboration opportunities?'
to guide development priorities.

## 11. SFT and DPO Experience

### What are SFT and DPO

SFT stands for Supervised Fine-Tuning.
It's the process of taking a pre-trained language model
and further training it on specific examples
to make it better at certain tasks.
It's like taking a general-purpose tool
and specializing it for a specific job.

DPO stands for Direct Preference Optimization.
It's a more advanced technique
that helps language models learn from human preferences.
Instead of just learning from examples,
the model learns which outputs humans prefer
over other outputs.
This makes the model more aligned
with human expectations and values.

Together, these techniques help create AI systems
that are both more capable
and better aligned with what users want.
In research settings,
this is especially important
because we need systems that provide accurate, helpful information.

### My Experience

At CIRA,
I worked on a project
using both SFT and DPO
to create an astronomy-focused AI assistant.

First, we used SFT
to specialize a general language model
for astronomy knowledge.
We trained it on astronomy datasets
including Astronomer's Telegram
and Stack Exchange questions.
This gave the model
domain-specific knowledge.

Then, we applied DPO
to further refine the model.
We collected examples of better and worse answers
to astronomy questions.
The model learned to prefer responses
that were more accurate and helpful
according to astronomy experts.

This experience taught me
how these techniques can transform
general AI systems
into domain-specific tools.
I believe similar approaches
could be very valuable
for computational biology
to create systems that understand
specialized biological terminology and concepts.

### Practical Example

For a question like
'Explain how pulsars emit radio waves,'
our initial model gave general information
that was technically correct
but lacked depth.

After SFT with astronomy data,
the model could provide
much more detailed explanations
including magnetosphere physics
and emission mechanisms.

After applying DPO,
the model learned to structure answers
in the way astronomers preferred,
with appropriate technical depth
and relevant citations to research.

I can see similar applications
in computational biology.
For example,
a model fine-tuned with SFT and DPO
could better understand and respond to queries
about protein structures, gene expression,
or disease mechanisms.
