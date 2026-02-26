mod cli;
mod mcp;

use std::path::PathBuf;

use clap::Parser;
use rmcp::{transport::stdio, ServiceExt};
use subby_core::SubbyCore;

#[derive(Parser)]
#[command(
    name = "subby-mcp",
    about = "Subby subscription tracker — CLI & MCP server",
    version
)]
struct Cli {
    /// Path to the Subby database file
    #[arg(long, env = "SUBBY_DB_PATH", global = true)]
    db_path: Option<PathBuf>,

    #[command(subcommand)]
    command: Option<cli::Command>,
}

fn resolve_db_path(cli_path: Option<PathBuf>) -> PathBuf {
    if let Some(path) = cli_path {
        return path;
    }

    if let Some(data_dir) = dirs::data_dir() {
        let app_dir = data_dir.join("com.newstella.subby");
        std::fs::create_dir_all(&app_dir).ok();
        return app_dir.join("subby.db");
    }

    PathBuf::from("subby.db")
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let db_path = resolve_db_path(cli.db_path);

    match cli.command {
        // No subcommand or explicit `serve` → MCP server mode
        None | Some(cli::Command::Serve) => {
            // Log to stderr (MCP protocol uses stdout)
            tracing_subscriber::fmt()
                .with_env_filter(
                    tracing_subscriber::EnvFilter::from_default_env()
                        .add_directive("subby_mcp=info".parse()?),
                )
                .with_writer(std::io::stderr)
                .init();

            tracing::info!("Opening database at: {}", db_path.display());

            let core = SubbyCore::new(&db_path)?;
            let service = mcp::SubbyMcp::new(core).serve(stdio()).await?;

            tracing::info!("subby-mcp server started");
            service.waiting().await?;
        }
        // CLI subcommand
        Some(command) => {
            let core = SubbyCore::new(&db_path)?;
            cli::run(command, &core)?;
        }
    }

    Ok(())
}
