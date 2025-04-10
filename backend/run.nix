nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python311
    pkgs.python311Packages.flask
    pkgs.python311Packages.flask-sqlalchemy
    pkgs.python311Packages.python-dotenv
  ];
  shellHook = ''
    python app.py
  '';
}