![Logo](logo/logo_high_res.png)

# parliament-viz.ch
(ADA CS-401 EPFL)

[Gael Lederrey](https://github.com/glederrey), [Jonas Racine](https://github.com/jonasracine) and [Joachim Muth](https://github.com/jmuth)

Find the final visualization at [www.parliament-viz.ch](http://www.parliament-viz.ch)

## Similar Project

A project about predictions on the same data exists [here](https://github.com/thom056/ada-parliament-ML). 

Both teams collaborated on various aspects of the project, including the *scraping* and the understanding of the data.

## Abstract

> The Freedom of Information Act came into force on 1 July 2006. It is intended to promote transparency with 
> regard to the purpose, organisation and activities of the federal administration, while guaranteeing access to 
> official documents produced after 1 July 2006.
>- [Swiss Parliament Website](https://www.parlament.ch/en/services/freedom-of-information-act)

The motivation for this project comes from the gulf existing between the political community and citizens. However, it represents a large number of hardly understandable documents. We suggest a visualization of what could be a light and user-friendly public interface of Swiss parliament activities.

## Data description
The whole data schema is accessible through [metadata web page](https://ws.parlament.ch/odata.svc/$metadata) and can be explored using [Pragmatica WOData visualization tool](https://pragmatiqa.com/xodata/)

We provide here a short summary (when the name is not self-explaining) of the main tables we consider in the project.

* **Transcript** contains textual transcription of all speeches made during regular parlamentary session.

* **Business** contains initiatives (motions, postulates, interpellation, ordinary questions, questions) made by deputies.

* **BusinessRole** contains role of each deputy in initiatives (author, cosignee, ...)

* **BusinessStatus**

* **BusinessType**

* **MemberCoucil** lists all parliament deputies

* **MemberParty**

* **Party**

* **Session** contains the date of each parliamentary session

* **Tags** classifies the initiatives into themes


## Feasibility and Risks

#### Parliamentary Terms
Complicated and precise terminology, specific to the political area.
[Lexicon of Parliamentary Terms](https://www.parlament.ch/en/über-das-parlament/parlamentswörterbuch)

#### Three official languages
Speakers debate in their own language, mainly in German and French. Textual analysis must take care not to lose information
by translating them into English.

#### Licences
[Open Data / Web services statement of Parliament website](https://www.parlament.ch/en/services/open-data-webservices)
The provided information can be freely used, under reasonable conditions (no alterations, source indicated, 
date of download indicated).

#### Data collecting
The data is available via API [here](https://ws.parlament.ch/odata.svc/$metadata)

#### Theme classification
Official bulletins don't contain clear *topic* attribute. The names of debated object do not always state clearly what they cover.
We will use NLP tools on speeches in order to extract their theme.

#### Visualization
The objective of the visualization is to show the importance of the different topics discussed in the parliament. To accomplish that, it must merge different points of view: frequency of the topic, evolution over time, importance compared to other subjects, diversity of speakers participating in the topic.

A big part of the project will be spent on how to visualize all these parameters. 

Source of inspiration : [legex timeline](http://www.legex.org/timeline/index.html#legislation=all&chamber=all&party=all&committee=all&majority=all&gender=all&state=all&outcomes=all&topics=all&view=total&zoomed=false&graphbar=false&relative=false)

#### Website hosting
The website will be deployed on [GitHub Pages](https://pages.github.com) and accessible through EPFL domain name.

#### Automation task
The task of grabbing, parsing, sorting and adding the data to our database (i.e. to our website since we will use D3) will be completely automated to allow future automatic updates each time a parliamentary session opens.

#### Data-Driven Documents
The D3 javaScript library will allow us to design a clean and interactive visualization. [D3 website](https://d3js.org)





## Deliverables 

The final product takes the form of an online website presenting an interactive visualization of Swiss Parliament deputies activity. This website will be on [parliament-viz.ch](www.paliament-viz.ch). 

This visualization on:
* the d3.js library
* jQuery
* bootstrap

Visitors have a general overview of the parliament where they can fly over each point and see some information about the deputy. Additionnaly, the whole parliament recolor itself to show the partnership the deputy maintains with the others.

A second visualization can seen by clicking the "Clustering" button, where the visitor can group the deputies on some criterias, as well as color them.

The website contains more information on page [About](http://www.parliament-viz.ch/#about)

## Chronology

  - **October 26th, 2016**: Start of the project
  - **November 6th, 2016**: Project approval
  - **November 9th, 2016**: Developing Python scraper
  - **November 17th, 2016**: Developing Python NLP analyser
  - **December 1st, 2016**: First cluster visualization
  - **December 6th, 2016**: Phone appointment with **Alain Rebetez**
    - Discussion about the paliamentary system
    - Discussion about what kind of informations could interest a journalist 
    - Reorientation of the project, more on visualization, less on interpretation
  - **December 8th, 2016**: Abandon of NLP tool for theme extraction, according with reorientation
  - **January 3rd, 2016**: First "parliament-overview" visualization
  - **January 6th, 2017**: Meeting with **Philippe Nantermod**
    - Discussion about the paliamentary system
    - Demonstration of the visualization and how intuitive it looks like for an external user
    - New ideas about how extract partnerships and interests of deputies
  - **January 20th, 2017**: Partnerships based on cosigned initiatives
  - **January 23th, 2017**: Merge of the two visualization: "parliament-overview" and "clusters"
  - **January 24th, 2017**: Interests based on theme of redacted initiatives
  - **January 28th, 2017**: Sub-clusters and majority by moving clusters into the visualization
  - **January 29th, 2017**: Website
  - **January 30th, 2017**: Poster
  - **January 31th, 2017**: Project presentation at **Applied Machine Learning Days** (EPFL)

## Acknowledgements
A warm thank you to **Alain Rebetez**, political journalist, **Philippe Nantermod**, PLR deputy at National Council, and **Mathias Reynard**, PS deputy, for their expertise in Swiss parliamentary system, their advice and their external point of view about the project.


