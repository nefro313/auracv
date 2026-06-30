"""Pydantic models describing the resume JSON the frontend consumes.

The shape mirrors the `UserProfile` TypeScript type in
`src/lib/type.ts` and the canonical example in `src/data/resume.json`.

A few fields the frontend overrides after extraction (avatar, email,
userName, theme colours) are intentionally left blank here — the AI does
not need to invent them and the Next.js `create` page fills them in from
the authenticated Supabase session.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class _Schema(BaseModel):
    """Base model: ignore unknown keys, allow population by field name."""

    model_config = ConfigDict(extra="ignore", populate_by_name=True)


class Meta(_Schema):
    resumeTheme: str = "professional"
    portfolioTheme: str = "basic"
    portfolioColor: str = "sky"
    userName: str = ""
    buttonText: str = "Hire me"
    avatarUrl: str = ""


class Location(_Schema):
    city: str = ""
    countryCode: str = ""


class Profile(_Schema):
    username: str = ""
    url: str = ""
    network: str = ""


class Basics(_Schema):
    name: str = ""
    phone: str = ""
    label: str = ""
    avatarUrl: str = ""
    about: str = ""
    website: str = ""
    resumeUrl: str = ""
    email: str = ""
    location: Location = Field(default_factory=Location)
    profiles: list[Profile] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class Certificate(_Schema):
    name: str = ""
    date: str = ""
    issuer: str = ""
    url: str = ""


class Education(_Schema):
    endDate: str = ""
    startDate: str = ""
    area: str = ""
    studyType: str = ""
    summary: str = ""
    institution: str = ""
    url: str = ""
    logo: str = ""
    score: str = ""
    courses: list[str] = Field(default_factory=list)


class Skill(_Schema):
    name: str = ""
    keywords: list[str] = Field(default_factory=list)


class Award(_Schema):
    title: str = ""
    awarder: str = ""
    date: str = ""
    summary: str = ""


class HackathonDetail(_Schema):
    title: str = ""
    dates: str = ""
    location: str = ""
    description: str = ""
    image: str = ""
    win: str = ""
    url: str = ""


class Hackathon(_Schema):
    description: str = ""
    hackathons: list[HackathonDetail] = Field(default_factory=list)


class Publication(_Schema):
    name: str = ""
    publisher: str = ""
    releaseDate: str = ""
    url: str = ""
    summary: str = ""


class Volunteer(_Schema):
    organization: str = ""
    position: str = ""
    url: str = ""
    startDate: str = ""
    summary: str = ""
    highlights: list[str] = Field(default_factory=list)


class Work(_Schema):
    summary: str = ""
    website: str = ""
    name: str = ""
    location: str = ""
    position: str = ""
    startDate: str = ""
    endDate: str = ""
    logo: str = ""
    highlights: list[str] = Field(default_factory=list)


class ProjectDetail(_Schema):
    title: str = ""
    description: str = ""
    website: str = ""
    source: str = ""
    duration: str = ""
    technologies: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    image: str = ""


class Project(_Schema):
    description: str = ""
    projects: list[ProjectDetail] = Field(default_factory=list)


class Language(_Schema):
    language: str = ""
    fluency: str = ""


class Interest(_Schema):
    name: str = ""
    keywords: list[str] = Field(default_factory=list)


class Reference(_Schema):
    reference: str = ""
    name: str = ""


class UserProfile(_Schema):
    """Full resume payload returned by `/extract-pdf`."""

    meta: Meta = Field(default_factory=Meta)
    basics: Basics = Field(default_factory=Basics)
    certificates: list[Certificate] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    awards: list[Award] = Field(default_factory=list)
    hackathons: Hackathon = Field(default_factory=Hackathon)
    publications: list[Publication] = Field(default_factory=list)
    volunteer: list[Volunteer] = Field(default_factory=list)
    work: list[Work] = Field(default_factory=list)
    projects: Project = Field(default_factory=Project)
    languages: list[Language] = Field(default_factory=list)
    interests: list[Interest] = Field(default_factory=list)
    references: list[Reference] = Field(default_factory=list)
