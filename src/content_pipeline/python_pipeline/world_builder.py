#!/usr/bin/env python3
"""
A sample pipeline for iterative world-building using LLMs in Python 3.
"""

from typing import List, Dict, Any, Optional
import json
import markdown
import re
import os

#
# Data Structures
#

class WorldSpec(Dict[str, Any]):
    """
    Basic structure for user-supplied world specs.
    Example fields:
      - theme: "High fantasy with steampunk elements"
      - magic_system: "Runic inscriptions"
      - factions: ["Kingdom of Lucienne", "Coastal Traders Guild"]
      - key_conflict: "Control of runic forges in the mountains"
      - etc.
    """

class WorldDescription(Dict[str, Any]):
    """
    After generating or expanding, we'll store the world in a dictionary.
    Keys might include: 'geography', 'magic', 'factions', 'cultures', 'conflict', etc.
    """

class CanonicalWorld(Dict[str, Any]):
    """
    Structure for storing canonical world information loaded from markdown.
    Keys are section headers from the markdown file.
    """

class Scenario(Dict[str, Any]):
    """
    Data structure for scenario hooks/quests. 
    Each scenario might have a 'title', 'summary', 'branches', etc.
    """

def parse_markdown_to_sections(markdown_text: str) -> Dict[str, str]:
    """
    Parse a markdown file into sections based on headers.
    
    :param markdown_text: Raw markdown text
    :return: Dictionary of section name to section content
    """
    sections = {}
    current_section = "PREAMBLE"
    current_content = []
    
    for line in markdown_text.split('\n'):
        if line.startswith('# '):
            # If we were building a section, save it
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
                current_content = []
            current_section = line[2:].strip()
        else:
            current_content.append(line)
    
    # Don't forget the last section
    if current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    
    return sections

def load_canonical_world(markdown_path: str) -> CanonicalWorld:
    """
    Load and parse the canonical world information from a markdown file.
    
    :param markdown_path: Path to the markdown file containing canonical world info
    :return: CanonicalWorld object containing parsed sections
    """
    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse into sections
    sections = parse_markdown_to_sections(content)
    
    # Convert to CanonicalWorld object
    return CanonicalWorld(sections)

def check_against_canon(proposed_content: str, 
                       canon: CanonicalWorld,
                       model: str = "gpt-4") -> List[str]:
    """
    Check proposed content against canonical world information for contradictions.
    
    :param proposed_content: The content to check
    :param canon: The canonical world information
    :param model: Which model to use for checking
    :return: List of contradictions or issues found
    """
    # Format the canonical info and proposed content for the LLM
    canon_str = json.dumps(canon, indent=2)
    
    prompt = (
        f"You are a Canonical Consistency Checker.\n"
        f"Below is the established canonical world information:\n\n"
        f"{canon_str}\n\n"
        f"And here is the proposed new content:\n\n"
        f"{proposed_content}\n\n"
        f"Please identify any contradictions or inconsistencies with the canonical world.\n"
        f"Focus on factual contradictions, tone mismatches, or violations of established rules.\n"
        f"Return them as a list of specific issues."
    )
    
    response = call_llm(prompt, model=model, temperature=0.0)
    
    # Parse response into list of issues
    issues = []
    for line in response.splitlines():
        line = line.strip()
        if line.startswith('-') or line.startswith('*'):
            issues.append(line.lstrip('-* ').strip())
    
    return issues

def generate_initial_world(summary: str,
                         canon: CanonicalWorld,
                         model: str = "gpt-4") -> WorldDescription:
    """
    Generates the initial world description from the summarized specs and canonical info.

    :param summary: A concise textual summary of the user's world specs.
    :param canon: The canonical world information to respect
    :param model: The LLM model for creative generation.
    :return: A dictionary representing the world description.
    """
    canon_str = json.dumps(canon, indent=2)
    prompt = (
        f"You are the World Architect.\n"
        f"Below is the canonical world information you must respect:\n\n"
        f"{canon_str}\n\n"
        f"And here is a concise summary of the desired additions:\n\n"
        f"{summary}\n\n"
        f"Please create an initial world description that builds upon and respects the canon. "
        f"Include keys for 'geography', 'magic', 'factions', 'cultures', and 'conflict'. "
        f"Output valid JSON that could be merged with the canonical information."
    )
    response = call_llm(prompt, model=model, temperature=0.8)
    
    # Attempt to parse as JSON
    try:
        world_data = json.loads(response)
    except json.JSONDecodeError:
        # If the model didn't return valid JSON, wrap or fix
        world_data = {"error": "Invalid JSON", "raw_output": response}
    return WorldDescription(world_data)

def expand_world(world_desc: WorldDescription,
                issues: List[str],
                canon: CanonicalWorld,
                model: str = "gpt-4") -> WorldDescription:
    """
    Addresses or clarifies the identified issues by modifying the world description.

    :param world_desc: Current world description (JSON/dict).
    :param issues: List of issues or contradictions.
    :param canon: The canonical world information to respect
    :param model: Which model to use for expansions.
    :return: Updated world description.
    """
    if not issues:
        # No changes needed
        return world_desc
    
    world_json = json.dumps(world_desc, indent=2)
    canon_str = json.dumps(canon, indent=2)
    issues_str = "\n".join(f"- {issue}" for issue in issues)
    
    prompt = (
        f"You are the World Expander.\n"
        f"Here is the canonical world information you must respect:\n\n"
        f"{canon_str}\n\n"
        f"Below is the current world description:\n\n"
        f"{world_json}\n\n"
        f"Here are the issues to address:\n"
        f"{issues_str}\n\n"
        f"Please revise or expand the JSON to resolve these issues while maintaining "
        f"consistency with the canonical world. Return valid JSON."
    )
    
    response = call_llm(prompt, model=model, temperature=0.7)
    try:
        world_data = json.loads(response)
    except json.JSONDecodeError:
        world_data = {"error": "Invalid JSON", "raw_output": response}
    return WorldDescription(world_data)

def generate_scenarios(world_desc: WorldDescription,
                      canon: CanonicalWorld,
                      num_scenarios: int = 3,
                      model: str = "gpt-3.5-turbo") -> List[Scenario]:
    """
    Generates a list of scenario hooks/quests based on the finalized world description.

    :param world_desc: The final or near-final world description.
    :param canon: The canonical world information to respect
    :param num_scenarios: How many scenario hooks to generate.
    :param model: LLM model to use.
    :return: A list of scenario dictionaries.
    """
    world_json = json.dumps(world_desc, indent=2)
    canon_str = json.dumps(canon, indent=2)
    prompt = (
        f"You are the Scenario Generator.\n"
        f"Here is the canonical world information you must respect:\n\n"
        f"{canon_str}\n\n"
        f"And here is the world description to build upon:\n\n"
        f"{world_json}\n\n"
        f"Generate {num_scenarios} distinct scenario hooks (quests or story arcs) "
        f"that fit within and respect the canonical world. "
        f"For each scenario, provide a short title and a concise summary. "
        f"Output as a JSON list of objects with keys: 'title' and 'summary'."
    )
    response = call_llm(prompt, model=model, temperature=0.8)
    
    try:
        scenarios_data = json.loads(response)
    except json.JSONDecodeError:
        scenarios_data = [{"error": "Invalid JSON", "raw_output": response}]
    return [Scenario(s) for s in scenarios_data]

def generate_branches(scenario: Scenario,
                      model: str = "gpt-3.5-turbo") -> Scenario:
    """
    Given a scenario, generate branching paths in a CYOA style.

    :param scenario: A single scenario with 'title' and 'summary'.
    :param model: Which model to use.
    :return: Scenario dictionary updated with 'branches' key, which is a list of options.
    """
    scenario_json = json.dumps(scenario, indent=2)
    prompt = (
        f"You are the Branch Generator.\n"
        f"Below is a scenario in JSON:\n\n"
        f"{scenario_json}\n\n"
        f"Generate multiple branching paths in a choose-your-own-adventure style. "
        f"For each branch, provide: 'branch_title', 'description', and 'potential_outcomes'. "
        f"Output them in JSON as an array of objects under a 'branches' key."
    )
    response = call_llm(prompt, model=model, temperature=0.8)
    
    try:
        branches_data = json.loads(response)
    except json.JSONDecodeError:
        branches_data = {"error": "Invalid JSON", "raw_output": response}
    
    # We expect branches_data to be something like {"branches": [...]} 
    # We'll merge it back into the scenario:
    if isinstance(branches_data, dict) and "branches" in branches_data:
        scenario["branches"] = branches_data["branches"]
    else:
        scenario["branches"] = []
    return scenario

def qa_rewrite(final_text: str,
               model: str = "gpt-3.5-turbo") -> str:
    """
    Performs a final QA pass and rewrite for style, clarity, etc.

    :param final_text: The text to be polished.
    :param model: The LLM for rewriting.
    :return: A cleaned-up version of the text.
    """
    prompt = (
        f"You are a QA Rewriter.\n"
        f"Please rewrite the following text for clarity and consistent style. "
        f"Aim to preserve content while improving flow.\n\n"
        f"{final_text}"
    )
    response = call_llm(prompt, model=model, temperature=0.5)
    return response

def summarize_requirements(spec: WorldSpec,
                           model: str = "gpt-4o-mini") -> str:
    """
    Summarizes the user's initial bullet-point specs into a short text.
    
    :param spec: A dictionary containing fields about the world spec.
    :param model: Which model to use for summarization.
    :return: A short textual summary of the specs.
    """
    # Construct a simple prompt from user specs
    spec_str = json.dumps(spec, indent=2)
    prompt = (
        f"You are a Summarizer.\n"
        f"Here are the world specifications in JSON form:\n\n"
        f"{spec_str}\n\n"
        f"Please rewrite these bullet points into a concise summary. "
        f"Keep it under 150 words and focus on the key elements that need to be "
        f"integrated with the existing canonical world."
    )
    summary = call_llm(prompt, model=model, temperature=0.0)
    return summary

def consistency_check(world_desc: WorldDescription,
                      model: str = "gpt-4o-mini") -> List[str]:
    """
    Checks the world description for logical contradictions or unclear details.
    This is separate from canonical consistency - it checks for internal logic issues.
    Returns a list of issues/questions.

    :param world_desc: The current world description in dictionary form.
    :param model: The model used to find contradictions.
    :return: A list of issues or clarifications needed.
    """
    world_json = json.dumps(world_desc, indent=2)
    prompt = (
        f"You are a Consistency Checker.\n"
        f"Below is the current world description in JSON:\n\n"
        f"{world_json}\n\n"
        f"List any internal contradictions, unclear details, or places needing elaboration. "
        f"Focus ONLY on internal logical consistency and completeness - do NOT check against canon. "
        f"Return them as bullet points."
    )
    response = call_llm(prompt, model=model, temperature=0.0)
    
    # Parse response into list of issues
    issues = []
    for line in response.splitlines():
        line_stripped = line.strip()
        if line_stripped.startswith("-") or line_stripped.startswith("*"):
            issues.append(line_stripped.lstrip("-*").strip())
    return issues

def call_llm(prompt: str, 
             model: str = "gpt-4o-mini", 
             temperature: float = 0.7, 
             max_tokens: int = 1024
             ) -> str:
    """
    Stub function simulating an LLM call.
    Replace with real code to call OpenAI, Anthropic, Google, or a local model.

    :param prompt: The text prompt to send to the LLM.
    :param model:  The identifier for the LLM model (e.g. "gpt-4").
    :param temperature: Sampling temperature for creativity.
    :param max_tokens: Max tokens to generate.
    :return: The LLM's output text.
    """
    import openai
    
    # Map our model names to OpenAI model names
    model_map = {
        "gpt-4o-mini": "gpt-4",  # Using gpt-4 for our mini version
        "gpt-4o": "gpt-4",       # Regular gpt-4
        "gpt-3.5-turbo": "gpt-3.5-turbo"
    }
    
    actual_model = model_map.get(model, model)
    
    response = openai.ChatCompletion.create(
        model=actual_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response["choices"][0]["message"]["content"]

#
# Orchestrating Everything
#

def run_pipeline(spec: WorldSpec, canon_path: str) -> None:
    """
    Orchestrates the entire pipeline from spec to final scenarios with branches.

    :param spec: The user's desired world specs.
    :param canon_path: Path to the markdown file containing canonical world info
    """
    # Load canonical world information
    print("=== 0) Loading Canonical World Information ===")
    canon = load_canonical_world(canon_path)
    print(f"Loaded {len(canon)} sections of canonical information")
    print()
    
    # Step A: Summarize
    summary = summarize_requirements(spec, model="gpt-4o-mini")
    print("=== 1) Summary of Requirements ===")
    print(summary)
    print()

    # Step B: Generate initial world
    world_desc = generate_initial_world(summary, canon, model="gpt-4o")
    print("=== 2) Initial World Description ===")
    print(json.dumps(world_desc, indent=2))
    print()

    # Step C: Check against canon and for consistency
    canon_issues = check_against_canon(json.dumps(world_desc), canon)
    consistency_issues = consistency_check(world_desc, model="gpt-3.5-turbo")
    all_issues = canon_issues + consistency_issues
    
    print("=== 3) Canonical and Consistency Issues ===")
    for issue in all_issues:
        print(f"- {issue}")
    print()

    # Step D: Expand world (fix issues)
    world_desc_expanded = expand_world(world_desc, all_issues, canon, model="gpt-4")
    print("=== 4) Expanded World Description ===")
    print(json.dumps(world_desc_expanded, indent=2))
    print()

    # Step E: Generate scenarios
    scenarios = generate_scenarios(world_desc_expanded, canon, num_scenarios=3, model="gpt-3.5-turbo")
    print("=== 5) Scenario Hooks ===")
    print(json.dumps(scenarios, indent=2))
    print()

    # Step F: Generate branching paths for each scenario
    for i, scenario in enumerate(scenarios):
        scenarios[i] = generate_branches(scenario, model="gpt-3.5-turbo")
    print("=== 6) Scenarios with Branches ===")
    print(json.dumps(scenarios, indent=2))
    print()

    # Step G: Final QA Rewrite
    scenario_block_json = json.dumps(scenarios, indent=2)
    final_polished = qa_rewrite(scenario_block_json, model="gpt-3.5-turbo")
    print("=== 7) Final QA Polished Output ===")
    print(final_polished)

#
# Example Usage
#

if __name__ == "__main__":
    # Example user specification for the world
    user_spec: WorldSpec = {
    }

    # Calculate paths relative to the script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..', '..'))
    canon_path = os.path.join(project_root, 'src', 'docs', 'worldbuilding.md')
    
    run_pipeline(user_spec, canon_path)
