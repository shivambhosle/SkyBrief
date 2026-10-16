from typing import List, Optional, Literal, Any, Dict
from pydantic import BaseModel, Field, field_validator
import re

ICAO_REGEX = re.compile(r"^[A-Za-z]{4}$")


class BriefingSummaryRequest(BaseModel):
    icao: str = Field(..., description="4-letter ICAO airport code (e.g. KJFK, EGLL)")
    report_type: Literal["METAR", "TAF"] = Field(..., description="Report type: METAR or TAF")

    @field_validator("icao")
    @classmethod
    def validate_icao(cls, v: str) -> str:
        v_clean = v.strip().upper()
        if not ICAO_REGEX.match(v_clean):
            raise ValueError("Invalid ICAO code: must be exactly 4 alphabetic characters.")
        return v_clean


class LLMBriefingOutput(BaseModel):
    summary: str = Field(..., description="Plain English weather briefing for a pilot, concise and factual.")
    wind_summary: str = Field(..., description="Concise summary of wind direction, speed, and gusts if present.")
    visibility_category: str = Field(..., description="Categorical or descriptive visibility status (e.g. Good, Marginal, Low, or Unknown).")
    ceiling_category: str = Field(..., description="Categorical or descriptive ceiling status (e.g. High, Marginal, Low, Clear, or Unknown).")
    hazards: List[str] = Field(default_factory=list, description="List of any operational hazards (e.g. low visibility, gusting winds, thunderstorms).")
    data_gaps: List[str] = Field(default_factory=list, description="List of missing or unknown fields in the report.")


class VerificationResult(BaseModel):
    passed: bool = Field(..., description="True if no numeric mismatches or forbidden phrases were found.")
    mismatches: List[str] = Field(default_factory=list, description="List of detected numeric mismatches or forbidden phrase violations.")


class BriefingSummaryResponse(BaseModel):
    icao: str
    report_type: str
    raw_report: Optional[str] = None
    parsed_data: Dict[str, Any] = Field(default_factory=dict)
    summary: LLMBriefingOutput
    verification: VerificationResult
    status: Literal["ok", "fallback"] = "ok"
